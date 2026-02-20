import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/infrastructure/prisma.service';
import { Inventory } from '../domain/Inventory';
import { InventoryRepository } from '../domain/InventoryRepository';

/**
 * Implementación del repositorio de Inventory usando Prisma
 * Mapea entre la entidad de dominio y el modelo de Prisma
 */
@Injectable()
export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(inventoryData: {
    variantId: number;
    quantity: number;
    minStockAlert: number;
  }): Promise<Inventory> {
    const createdInventory = await this.prisma.inventory.create({
      data: {
        variantId: inventoryData.variantId,
        quantity: inventoryData.quantity,
        minStockAlert: inventoryData.minStockAlert,
      },
    });

    return this.mapToDomainEntity(createdInventory);
  }

  async getByVariant(variantId: number): Promise<Inventory | null> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { variantId },
    });

    if (!inventory) {
      return null;
    }

    return this.mapToDomainEntity(inventory);
  }

  async updateStock(variantId: number, quantity: number): Promise<Inventory> {
    const updatedInventory = await this.prisma.inventory.upsert({
      where: { variantId },
      update: {
        quantity,
        updatedAt: new Date(),
      },
      create: {
        variantId,
        quantity,
        minStockAlert: 0,
      },
    });

    return this.mapToDomainEntity(updatedInventory);
  }

  async updateMinStockAlert(variantId: number, minStockAlert: number): Promise<Inventory> {
    const updatedInventory = await this.prisma.inventory.update({
      where: { variantId },
      data: {
        minStockAlert,
        updatedAt: new Date(),
      },
    });

    return this.mapToDomainEntity(updatedInventory);
  }

  async increaseStock(variantId: number, quantity: number): Promise<Inventory> {
    const updatedInventory = await this.prisma.inventory.update({
      where: { variantId },
      data: {
        quantity: {
          increment: quantity,
        },
        updatedAt: new Date(),
      },
    });

    return this.mapToDomainEntity(updatedInventory);
  }

  async decreaseStock(variantId: number, quantity: number): Promise<Inventory> {
    const updatedInventory = await this.prisma.inventory.update({
      where: { variantId },
      data: {
        quantity: {
          decrement: quantity,
        },
        updatedAt: new Date(),
      },
    });

    return this.mapToDomainEntity(updatedInventory);
  }

  async listLowStock(): Promise<Inventory[]> {
    const inventories = await this.prisma.inventory.findMany({
      where: {
        quantity: {
          lte: this.prisma.inventory.fields.minStockAlert,
        },
        minStockAlert: {
          gt: 0,
        },
      },
      orderBy: { quantity: 'asc' },
    });

    return inventories.map(inventory => this.mapToDomainEntity(inventory));
  }

  async listOutOfStock(): Promise<Inventory[]> {
    const inventories = await this.prisma.inventory.findMany({
      where: { quantity: 0 },
      orderBy: { updatedAt: 'desc' },
    });

    return inventories.map(inventory => this.mapToDomainEntity(inventory));
  }

  async existsForVariant(variantId: number): Promise<boolean> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { variantId },
      select: { id: true },
    });

    return !!inventory;
  }

  /**
   * Mapea del modelo Prisma a la entidad de dominio
   */
  private mapToDomainEntity(prismaInventory: any): Inventory {
    return new Inventory(
      prismaInventory.id,
      prismaInventory.variantId,
      prismaInventory.quantity,
      prismaInventory.minStockAlert,
      prismaInventory.updatedAt,
    );
  }
}
