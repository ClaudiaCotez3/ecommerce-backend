import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { InventoryRepository } from '../domain';

/**
 * Implementación de Prisma para InventoryRepository en el módulo de pedidos
 * Proporciona acceso al inventario para operaciones de pedidos
 * 
 * NOTA: Esta implementación asume que todos los productos tienen variantes.
 * Para productos sin variantes, se debe crear una variante "default".
 */
@Injectable()
export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableStock(productId: number, variantId: number | null): Promise<number> {
    if (!variantId) {
      // Si no hay variantId, buscar la variante por defecto del producto
      const defaultVariant = await this.prisma.productVariant.findFirst({
        where: {
          productId,
        },
        include: {
          inventory: true,
        },
      });

      if (!defaultVariant?.inventory) {
        return 0;
      }

      return defaultVariant.inventory.quantity;
    }

    const inventory = await this.prisma.inventory.findFirst({
      where: {
        variantId,
      },
    });

    return inventory ? inventory.quantity : 0;
  }

  async hasEnoughStock(productId: number, variantId: number | null, quantity: number): Promise<boolean> {
    const availableStock = await this.getAvailableStock(productId, variantId);
    return availableStock >= quantity;
  }

  async decreaseStock(productId: number, variantId: number | null, quantity: number): Promise<void> {
    let targetVariantId = variantId;

    if (!variantId) {
      // Si no hay variantId, buscar la variante por defecto del producto
      const defaultVariant = await this.prisma.productVariant.findFirst({
        where: {
          productId,
        },
      });

      if (!defaultVariant) {
        throw new Error(`No se encontró variante para el producto ${productId}`);
      }

      targetVariantId = defaultVariant.id;
    }

    const inventory = await this.prisma.inventory.findFirst({
      where: {
        variantId: targetVariantId!,
      },
    });

    if (!inventory) {
      throw new Error(`Inventario no encontrado para producto ${productId}${variantId ? ` variante ${variantId}` : ''}`);
    }

    if (inventory.quantity < quantity) {
      throw new Error(`Stock insuficiente. Disponible: ${inventory.quantity}, solicitado: ${quantity}`);
    }

    await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }

  async increaseStock(productId: number, variantId: number | null, quantity: number): Promise<void> {
    let targetVariantId = variantId;

    if (!variantId) {
      // Si no hay variantId, buscar la variante por defecto del producto
      const defaultVariant = await this.prisma.productVariant.findFirst({
        where: {
          productId,
        },
      });

      if (!defaultVariant) {
        throw new Error(`No se encontró variante para el producto ${productId}`);
      }

      targetVariantId = defaultVariant.id;
    }

    const inventory = await this.prisma.inventory.findFirst({
      where: {
        variantId: targetVariantId!,
      },
    });

    if (!inventory) {
      throw new Error(`Inventario no encontrado para producto ${productId}${variantId ? ` variante ${variantId}` : ''}`);
    }

    await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });
  }

  async reserveStock(productId: number, variantId: number | null, quantity: number): Promise<void> {
    // NOTA: El esquema actual no tiene campos para stock reservado
    // Por simplicidad, este método solo verifica que hay stock disponible
    // En un sistema real, se podría implementar con campos adicionales en la tabla Inventory
    
    const hasStock = await this.hasEnoughStock(productId, variantId, quantity);
    if (!hasStock) {
      const availableStock = await this.getAvailableStock(productId, variantId);
      throw new Error(`Stock insuficiente para reservar. Disponible: ${availableStock}, solicitado: ${quantity}`);
    }

    // En este caso, la "reserva" es conceptual - no modificamos el stock hasta que se confirme
    // Un sistema más sofisticado tendría campos separados para available/reserved
  }

  async releaseReservedStock(productId: number, variantId: number | null, quantity: number): Promise<void> {
    // NOTA: El esquema actual no tiene campos para stock reservado
    // Este método es conceptual - en la implementación actual no hace nada
    // porque no tenemos stock reservado real
    
    // En un sistema real con campos reserved/available, aquí se liberaría la reserva
  }

  async validateStockForItems(items: {
    productId: number;
    variantId: number | null;
    quantity: number;
  }[]): Promise<{
    isValid: boolean;
    insufficientItems: {
      productId: number;
      variantId: number | null;
      requestedQuantity: number;
      availableStock: number;
    }[];
  }> {
    const insufficientItems: {
      productId: number;
      variantId: number | null;
      requestedQuantity: number;
      availableStock: number;
    }[] = [];

    // Verificar stock para cada item
    for (const item of items) {
      const availableStock = await this.getAvailableStock(item.productId, item.variantId);
      
      if (availableStock < item.quantity) {
        insufficientItems.push({
          productId: item.productId,
          variantId: item.variantId,
          requestedQuantity: item.quantity,
          availableStock,
        });
      }
    }

    return {
      isValid: insufficientItems.length === 0,
      insufficientItems,
    };
  }

  async adjustMultipleStock(adjustments: {
    productId: number;
    variantId: number | null;
    quantity: number;
  }[]): Promise<void> {
    // Usar una transacción para asegurar consistencia
    await this.prisma.$transaction(async (prismaTransaction) => {
      for (const adjustment of adjustments) {
        let targetVariantId = adjustment.variantId;

        if (!targetVariantId) {
          // Si no hay variantId, buscar la variante por defecto del producto
          const defaultVariant = await prismaTransaction.productVariant.findFirst({
            where: {
              productId: adjustment.productId,
            },
          });

          if (!defaultVariant) {
            throw new Error(`No se encontró variante para el producto ${adjustment.productId}`);
          }

          targetVariantId = defaultVariant.id;
        }

        const inventory = await prismaTransaction.inventory.findFirst({
          where: {
            variantId: targetVariantId,
          },
        });

        if (!inventory) {
          throw new Error(
            `Inventario no encontrado para producto ${adjustment.productId}${
              adjustment.variantId ? ` variante ${adjustment.variantId}` : ''
            }`
          );
        }

        // Si la cantidad es negativa (disminuir stock), verificar que hay suficiente
        if (adjustment.quantity < 0 && inventory.quantity < Math.abs(adjustment.quantity)) {
          throw new Error(
            `Stock insuficiente para producto ${adjustment.productId}${
              adjustment.variantId ? ` variante ${adjustment.variantId}` : ''
            }. Disponible: ${inventory.quantity}, solicitado disminuir: ${Math.abs(adjustment.quantity)}`
          );
        }

        // Aplicar el ajuste
        await prismaTransaction.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: {
              increment: adjustment.quantity, // Positivo aumenta, negativo disminuye
            },
          },
        });
      }
    });
  }
}
