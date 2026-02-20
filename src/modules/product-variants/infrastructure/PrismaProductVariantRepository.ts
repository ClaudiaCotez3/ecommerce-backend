import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/infrastructure/prisma.service';
import { ProductVariant } from '../domain/ProductVariant';
import { ProductVariantRepository } from '../domain/ProductVariantRepository';

/**
 * Implementación del repositorio de ProductVariant usando Prisma
 * Mapea entre la entidad de dominio y el modelo de Prisma
 */
@Injectable()
export class PrismaProductVariantRepository implements ProductVariantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(variantData: {
    productId: number;
    sku: string;
    specialPrice: number | null;
    attributes: Record<string, any>;
    status: string;
  }): Promise<ProductVariant> {
    const createdVariant = await this.prisma.productVariant.create({
      data: {
        productId: variantData.productId,
        sku: variantData.sku,
        specialPrice: variantData.specialPrice,
        attributes: variantData.attributes,
        status: variantData.status,
      },
    });

    return this.mapToDomainEntity(createdVariant);
  }

  async findById(id: number): Promise<ProductVariant | null> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      return null;
    }

    return this.mapToDomainEntity(variant);
  }

  async findBySku(sku: string): Promise<ProductVariant | null> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { sku },
    });

    if (!variant) {
      return null;
    }

    return this.mapToDomainEntity(variant);
  }

  async listByProduct(productId: number): Promise<ProductVariant[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { sku: 'asc' },
    });

    return variants.map(variant => this.mapToDomainEntity(variant));
  }

  async update(
    variantId: number,
    updateData: {
      sku?: string;
      specialPrice?: number | null;
      attributes?: Record<string, any>;
      status?: string;
    }
  ): Promise<ProductVariant> {
    const updatedVariant = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: updateData,
    });

    return this.mapToDomainEntity(updatedVariant);
  }

  async existsBySku(sku: string, excludeId?: number): Promise<boolean> {
    const whereClause: any = { sku };
    
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const variant = await this.prisma.productVariant.findFirst({
      where: whereClause,
      select: { id: true },
    });

    return !!variant;
  }

  async belongsToProduct(variantId: number, productId: number): Promise<boolean> {
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId: productId,
      },
      select: { id: true },
    });

    return !!variant;
  }

  /**
   * Mapea del modelo Prisma a la entidad de dominio
   */
  private mapToDomainEntity(prismaVariant: any): ProductVariant {
    return new ProductVariant(
      prismaVariant.id,
      prismaVariant.productId,
      prismaVariant.sku,
      prismaVariant.specialPrice ? Number(prismaVariant.specialPrice) : null,
      prismaVariant.attributes as Record<string, any>,
      prismaVariant.status,
    );
  }
}
