import { Module } from '@nestjs/common';
import { PrismaService } from '../auth/infrastructure/prisma.service';
import { ShopUsersModule } from '../shop-users/shop-users.module';

// Domain
import type { InventoryRepository } from './domain/InventoryRepository';

// Application
import { UpdateStock } from './application/UpdateStock';
import { AdjustStock } from './application/AdjustStock';
import { GetInventoryByVariant } from './application/GetInventoryByVariant';

// Infrastructure
import { PrismaInventoryRepository } from './infrastructure/PrismaInventoryRepository';
import { InventoryController } from './infrastructure/InventoryController';

/**
 * Módulo de Inventory
 * Configura la inyección de dependencias siguiendo principios hexagonales
 */
@Module({
  imports: [ShopUsersModule],
  controllers: [InventoryController],
  providers: [
    // Servicios de infraestructura
    PrismaService,
    
    // Repositorios
    {
      provide: 'InventoryRepository',
      useClass: PrismaInventoryRepository,
    },
    
    // Casos de uso
    {
      provide: UpdateStock,
      useFactory: (repository: InventoryRepository) => {
        return new UpdateStock(repository);
      },
      inject: ['InventoryRepository'],
    },
    
    {
      provide: AdjustStock,
      useFactory: (repository: InventoryRepository) => {
        return new AdjustStock(repository);
      },
      inject: ['InventoryRepository'],
    },
    
    {
      provide: GetInventoryByVariant,
      useFactory: (repository: InventoryRepository) => {
        return new GetInventoryByVariant(repository);
      },
      inject: ['InventoryRepository'],
    },
  ],
  exports: [
    'InventoryRepository',
    UpdateStock,
    AdjustStock,
    GetInventoryByVariant,
  ],
})
export class InventoryModule {}
