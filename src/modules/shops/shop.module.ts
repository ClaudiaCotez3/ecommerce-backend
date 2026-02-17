import { Module } from '@nestjs/common';
import { PrismaService } from '../auth/infrastructure/prisma.service';

// Domain
import type { ShopRepository } from './domain/ShopRepository';
import type { SlugGenerator } from './domain/SlugGenerator';

// Application
import { CreateShop } from './application/CreateShop';
import { GetShopsByOwner } from './application/GetShopsByOwner';

// Infrastructure
import { PrismaShopRepository } from './infrastructure/PrismaShopRepository';
import { SimpleSlugGenerator } from './infrastructure/SimpleSlugGenerator';
import { ShopController } from './infrastructure/ShopController';

/**
 * Módulo de Shops
 * Configura la inyección de dependencias siguiendo principios hexagonales
 */
@Module({
  imports: [],
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
  ],
  exports: [
    'ShopRepository',
    CreateShop,
    GetShopsByOwner,
  ],
})
export class ShopsModule {}