import { Module } from '@nestjs/common';
import {
  OrderController,
  PrismaOrderRepository,
  PrismaInventoryRepository,
  PrismaService,
} from './infrastructure';
import {
  CreateOrder,
  AddItemToOrder,
  ConfirmOrder,
  GetOrdersByShop,
  GetOrderById,
  CancelOrder,
} from './application';
import { ORDER_REPOSITORY, INVENTORY_REPOSITORY } from './tokens';

/**
 * Módulo de Orders
 * Configura la inyección de dependencias siguiendo arquitectura hexagonal
 */
@Module({
  imports: [],
  controllers: [OrderController],
  providers: [
    // Servicios de infraestructura
    PrismaService,
    
    // Repositorios - implementaciones específicas
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    {
      provide: INVENTORY_REPOSITORY,
      useClass: PrismaInventoryRepository,
    },
    
    // Casos de uso de la capa de aplicación
    CreateOrder,
    AddItemToOrder,
    ConfirmOrder,
    GetOrdersByShop,
    GetOrderById,
    CancelOrder,
  ],
  exports: [
    // Exportar para que otros módulos puedan usar los casos de uso
    CreateOrder,
    AddItemToOrder,
    ConfirmOrder,
    GetOrdersByShop,
    GetOrderById,
    CancelOrder,
    ORDER_REPOSITORY,
    INVENTORY_REPOSITORY,
  ],
})
export class OrdersModule {}
