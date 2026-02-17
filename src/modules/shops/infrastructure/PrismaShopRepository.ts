import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/infrastructure/prisma.service';
import { Shop } from '../domain/Shop';
import { ShopRepository } from '../domain/ShopRepository';

/**
 * Implementación del repositorio de Shop usando Prisma
 * Mapea entre la entidad de dominio y el modelo de Prisma
 */
@Injectable()
export class PrismaShopRepository implements ShopRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(shopData: {
    name: string;
    slug: string;
    description: string | null;
    currency: string;
    status: string;
    ownerId: string;
  }): Promise<Shop> {
    const createdShop = await this.prisma.shop.create({
      data: {
        name: shopData.name,
        slug: shopData.slug,
        description: shopData.description,
        currency: shopData.currency,
        status: shopData.status,
        ownerId: shopData.ownerId,
      },
    });

    return this.mapToDomainEntity(createdShop);
  }

  async findById(id: number): Promise<Shop | null> {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
    });

    if (!shop) {
      return null;
    }

    return this.mapToDomainEntity(shop);
  }

  async findByOwner(ownerId: string): Promise<Shop[]> {
    const shops = await this.prisma.shop.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return shops.map(shop => this.mapToDomainEntity(shop));
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const shop = await this.prisma.shop.findUnique({
      where: { slug },
      select: { id: true },
    });

    return !!shop;
  }

  /**
   * Mapea del modelo Prisma a la entidad de dominio
   */
  private mapToDomainEntity(prismaShop: any): Shop {
    return new Shop(
      prismaShop.id,
      prismaShop.name,
      prismaShop.slug,
      prismaShop.description,
      prismaShop.currency,
      prismaShop.status,
      prismaShop.ownerId,
      prismaShop.createdAt,
    );
  }
}
