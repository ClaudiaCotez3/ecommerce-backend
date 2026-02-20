import { Module } from '@nestjs/common';
import { PrismaService } from '../auth/infrastructure/prisma.service';

// Domain
import type { ProductVariantRepository } from './domain/ProductVariantRepository';

// Application
import { CreateVariant } from './application/CreateVariant';
import { GetVariantsByProduct } from './application/GetVariantsByProduct';

// Infrastructure
import { PrismaProductVariantRepository } from './infrastructure/PrismaProductVariantRepository';
import { VariantController } from './infrastructure/VariantController';

/**
 * Módulo de ProductVariants
 * Configura la inyección de dependencias siguiendo principios hexagonales
 */
@Module({
  imports: [],
  controllers: [VariantController],
  providers: [
    // Servicios de infraestructura
    PrismaService,
    
    // Repositorios
    {
      provide: 'ProductVariantRepository',
      useClass: PrismaProductVariantRepository,
    },
    
    // Casos de uso
    {
      provide: CreateVariant,
      useFactory: (repository: ProductVariantRepository) => {
        return new CreateVariant(repository);
      },
      inject: ['ProductVariantRepository'],
    },
    
    {
      provide: GetVariantsByProduct,
      useFactory: (repository: ProductVariantRepository) => {
        return new GetVariantsByProduct(repository);
      },
      inject: ['ProductVariantRepository'],
    },
  ],
  exports: [
    'ProductVariantRepository',
    CreateVariant,
    GetVariantsByProduct,
  ],
})
export class ProductVariantsModule {}
