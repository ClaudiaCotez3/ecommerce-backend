import { Module } from '@nestjs/common';
import { PrismaService } from '../auth/infrastructure/prisma.service';
import { ShopUsersModule } from '../shop-users/shop-users.module';

// Domain
import type { ShopRepository } from './domain/ShopRepository';
import type { SlugGenerator } from './domain/SlugGenerator';
import type { ShopUserRepository } from '../shop-users/domain/ShopUserRepository';

// Application
import { CreateShop } from './application/CreateShop';
import { GetShopsByOwner } from './application/GetShopsByOwner';
import { GetShopById } from './application/GetShopById';

// Infrastructure
import { PrismaShopRepository } from './infrastructure/PrismaShopRepository';
import { SimpleSlugGenerator } from './infrastructure/SimpleSlugGenerator';
import { ShopController } from './infrastructure/ShopController';

/**
 * Módulo de Shops
 * Configura la inyección de dependencias siguiendo principios hexagonales
 */
@Module({
  imports: [ShopUsersModule],
  controllers: [ShopController],
  providers: [
    // Servicios de infraestructura
    PrismaService,
    
    // Repositorios
    {
      provide: 'ShopRepository',
      useClass: PrismaShopRepository,
    },
    
    // Servicios de dominio
    {
      provide: 'SlugGenerator',
      useClass: SimpleSlugGenerator,
    },
    
    // Casos de uso
    {
      provide: CreateShop,
      useFactory: (
        shopRepository: ShopRepository,
        slugGenerator: SlugGenerator,
      ) => {
        return new CreateShop(shopRepository, slugGenerator);
      },
      inject: ['ShopRepository', 'SlugGenerator'],
    },
    
    {
      provide: GetShopsByOwner,
      useFactory: (shopRepository: ShopRepository) => {
        return new GetShopsByOwner(shopRepository);
      },
      inject: ['ShopRepository'],
    },
    
    {
      provide: GetShopById,
      useFactory: (
        shopRepository: ShopRepository,
        shopUserRepository: ShopUserRepository,
      ) => {
        return new GetShopById(shopRepository, shopUserRepository);
      },
      inject: ['ShopRepository', 'ShopUserRepository'],
    },
  ],
  exports: [
    'ShopRepository',
    CreateShop,
    GetShopsByOwner,
    GetShopById,
  ],
})
export class ShopsModule {}