import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/infrastructure/prisma.service';
import { Category } from '../domain/Category';
import { CategoryRepository } from '../domain/CategoryRepository';

/**
 * Implementación del repositorio de Category usando Prisma
 * Mapea entre la entidad de dominio y el modelo de Prisma
 */
@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(categoryData: {
    shopId: number;
    name: string;
    description: string | null;
  }): Promise<Category> {
    const createdCategory = await this.prisma.category.create({
      data: {
        shopId: categoryData.shopId,
        name: categoryData.name,
        description: categoryData.description,
      },
    });

    return this.mapToDomainEntity(createdCategory);
  }

  async findById(categoryId: number): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return null;
    }

    return this.mapToDomainEntity(category);
  }

  async listByShop(shopId: number): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { shopId },
      orderBy: { name: 'asc' },
    });

    return categories.map(category => this.mapToDomainEntity(category));
  }

  async assignProduct(categoryId: number, productId: number): Promise<void> {
    // Crear la relación en la tabla ProductCategory
    await this.prisma.productCategory.create({
      data: {
        categoryId,
        productId,
      },
    });
  }

  async existsByName(shopId: number, name: string): Promise<boolean> {
    const category = await this.prisma.category.findFirst({
      where: {
        shopId,
        name: {
          equals: name,
          mode: 'insensitive', // Case-insensitive comparison
        },
      },
      select: { id: true },
    });

    return !!category;
  }

  async isProductAssigned(categoryId: number, productId: number): Promise<boolean> {
    const assignment = await this.prisma.productCategory.findUnique({
      where: {
        productId_categoryId: {
          productId,
          categoryId,
        },
      },
      select: { productId: true },
    });

    return !!assignment;
  }

  async getCategoriesByProduct(productId: number): Promise<Category[]> {
    const productCategories = await this.prisma.productCategory.findMany({
      where: { productId },
      include: {
        category: true,
      },
    });

    return productCategories.map(pc => this.mapToDomainEntity(pc.category));
  }

  /**
   * Mapea del modelo Prisma a la entidad de dominio
   */
  private mapToDomainEntity(prismaCategory: any): Category {
    return new Category(
      prismaCategory.id,
      prismaCategory.shopId,
      prismaCategory.name,
      prismaCategory.description,
    );
  }
}
