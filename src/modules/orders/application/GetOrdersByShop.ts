import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository } from '../domain';
import { Order } from '../domain';
import { ORDER_REPOSITORY } from '../tokens';

/**
 * Caso de uso: Obtener pedidos por tienda
 * Recupera todos los pedidos de una tienda específica
 */
@Injectable()
export class GetOrdersByShop {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(shopId: number): Promise<Order[]> {
    // Validaciones básicas
    if (!shopId || shopId <= 0) {
      throw new Error('ID de tienda inválido');
    }

    // Obtener los pedidos de la tienda
    const orders = await this.orderRepository.findByShop(shopId);

    return orders;
  }
}
