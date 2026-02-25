import { Module } from '@nestjs/common';
import { PrismaService } from '../auth/infrastructure/prisma.service';

// Domain
import type { ProductRepository } from './domain/ProductRepository';

// Application
import { CreateProduct } from './application/CreateProduct';
import { UpdateProduct } from './application/UpdateProduct';
import { GetProductsByShop } from './application/GetProductsByShop';
import { ChangeProductStatus } from './application/ChangeProductStatus';

// Infrastructure
import { PrismaProductRepository } from './infrastructure/PrismaProductRepository';
import { ProductController } from './infrastructure/ProductController';

/**
 * Módulo de Products
 * Configura la inyección de dependencias siguiendo principios hexagonales
 */
@Module({
  imports: [], // Ya no necesita ShopUsersModule porque está disponible globalmente
  controllers: [ProductController],
  providers: [
    // Servicios de infraestructura
    PrismaService,
    
    // Repositorios
    {
      provide: 'ProductRepository',
      useClass: PrismaProductRepository,
    },
    
    // Casos de uso
    {
      provide: CreateProduct,
      useFactory: (productRepository: ProductRepository) => {
        return new CreateProduct(productRepository);
      },
      inject: ['ProductRepository'],
    },
    
    {
      provide: UpdateProduct,
      useFactory: (productRepository: ProductRepository) => {
        return new UpdateProduct(productRepository);
      },
      inject: ['ProductRepository'],
    },
    
    {
      provide: GetProductsByShop,
      useFactory: (productRepository: ProductRepository) => {
        return new GetProductsByShop(productRepository);
      },
      inject: ['ProductRepository'],
    },
    
    {
      provide: ChangeProductStatus,
      useFactory: (productRepository: ProductRepository) => {
        return new ChangeProductStatus(productRepository);
      },
      inject: ['ProductRepository'],
    },
  ],
  exports: [
    'ProductRepository',
    CreateProduct,
    UpdateProduct,
    GetProductsByShop,
    ChangeProductStatus,
  ],
})
export class ProductsModule {}
