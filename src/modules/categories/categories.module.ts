import { Module } from '@nestjs/common';
import { PrismaService } from '../auth/infrastructure/prisma.service';

// Domain
import type { CategoryRepository } from './domain/CategoryRepository';

// Application
import { CreateCategory } from './application/CreateCategory';
import { AssignProductToCategory } from './application/AssignProductToCategory';
import { GetCategoriesByShop } from './application/GetCategoriesByShop';

// Infrastructure
import { PrismaCategoryRepository } from './infrastructure/PrismaCategoryRepository';
import { CategoryController } from './infrastructure/CategoryController';

/**
 * Módulo de Categories
 * Configura la inyección de dependencias siguiendo principios hexagonales
 */
@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [
    // Servicios de infraestructura
    PrismaService,
    
    // Repositorios
    {
      provide: 'CategoryRepository',
      useClass: PrismaCategoryRepository,
    },
    
    // Casos de uso
    {
      provide: CreateCategory,
      useFactory: (categoryRepository: CategoryRepository) => {
        return new CreateCategory(categoryRepository);
      },
      inject: ['CategoryRepository'],
    },
    
    {
      provide: AssignProductToCategory,
      useFactory: (categoryRepository: CategoryRepository) => {
        return new AssignProductToCategory(categoryRepository);
      },
      inject: ['CategoryRepository'],
    },
    
    {
      provide: GetCategoriesByShop,
      useFactory: (categoryRepository: CategoryRepository) => {
        return new GetCategoriesByShop(categoryRepository);
      },
      inject: ['CategoryRepository'],
    },
  ],
  exports: [
    'CategoryRepository',
    CreateCategory,
    AssignProductToCategory,
    GetCategoriesByShop,
  ],
})
export class CategoriesModule {}
