import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/infrastructure/prisma.service';
import { Product } from '../domain/Product';
import { ProductRepository } from '../domain/ProductRepository';

/**
 * Implementación del repositorio de Product usando Prisma
 * Mapea entre la entidad de dominio y el modelo de Prisma
 */
@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(productData: {
    shopId: number;
    name: string;
    description: string | null;
    basePrice: number;
    status: string;
  }): Promise<Product> {
    const createdProduct = await this.prisma.product.create({
      data: {
        shopId: productData.shopId,
        name: productData.name,
        description: productData.description,
        basePrice: productData.basePrice,
        status: productData.status,
      },
    });

    return this.mapToDomainEntity(createdProduct);
  }

  async update(
    productId: number,
    updateData: {
      name?: string;
      description?: string | null;
      basePrice?: number;
      status?: string;
    }
  ): Promise<Product> {
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return this.mapToDomainEntity(updatedProduct);
  }

  async findById(productId: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return null;
    }

    return this.mapToDomainEntity(product);
  }

  async listByShop(
    shopId: number,
    filters?: {
      status?: string;
      searchTerm?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Product[]> {
    const whereClause: any = { shopId };

    // Filtro por estado
    if (filters?.status && filters.status !== 'all') {
      whereClause.status = filters.status;
    }

    // Filtro por término de búsqueda
    if (filters?.searchTerm) {
      whereClause.OR = [
        {
          name: {
            contains: filters.searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    const products = await this.prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    return products.map(product => this.mapToDomainEntity(product));
  }

  async changeStatus(productId: number, status: string): Promise<Product> {
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: { status },
    });

    return this.mapToDomainEntity(updatedProduct);
  }

  async belongsToShop(productId: number, shopId: number): Promise<boolean> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        shopId: shopId,
      },
      select: { id: true },
    });

    return !!product;
  }

  /**
   * Mapea del modelo Prisma a la entidad de dominio
   */
  private mapToDomainEntity(prismaProduct: any): Product {
    return new Product(
      prismaProduct.id,
      prismaProduct.shopId,
      prismaProduct.name,
      prismaProduct.description,
      Number(prismaProduct.basePrice),
      prismaProduct.status,
      prismaProduct.createdAt,
    );
  }
}
