import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository } from '../domain';
import { Order, OrderDetail } from '../domain';
import { ORDER_REPOSITORY } from '../tokens';

/**
 * Caso de uso: Obtener un pedido por ID con sus detalles
 * Recupera un pedido específico junto con todos sus items
 */
@Injectable()
export class GetOrderById {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(orderId: number): Promise<{ order: Order; details: OrderDetail[] }> {
    // Validaciones básicas
    if (!orderId || orderId <= 0) {
      throw new Error('ID de pedido inválido');
    }

    // Obtener el pedido con sus detalles
    const orderWithDetails = await this.orderRepository.findByIdWithDetails(orderId);

    if (!orderWithDetails) {
      throw new Error('Pedido no encontrado');
    }

    return orderWithDetails;
  }
}
