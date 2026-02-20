import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository, InventoryRepository } from '../domain';
import { Order } from '../domain';
import { ORDER_REPOSITORY, INVENTORY_REPOSITORY } from '../tokens';

/**
 * Caso de uso: Cancelar un pedido
 * Cambia el estado a cancelado y libera el stock reservado/ocupado
 */
@Injectable()
export class CancelOrder {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async execute(orderId: number): Promise<Order> {
    // Validaciones básicas
    if (!orderId || orderId <= 0) {
      throw new Error('ID de pedido inválido');
    }

    // Verificar que el pedido existe
    const orderWithDetails = await this.orderRepository.findByIdWithDetails(orderId);
    if (!orderWithDetails) {
      throw new Error('Pedido no encontrado');
    }

    const { order, details } = orderWithDetails;

    // Verificar que el pedido no esté ya cancelado
    if (order.status === 'cancelled') {
      throw new Error('El pedido ya está cancelado');
    }

    // No se pueden cancelar pedidos entregados
    if (order.status === 'delivered') {
      throw new Error('No se puede cancelar un pedido ya entregado');
    }

    try {
      // Liberar/restaurar stock según el estado actual del pedido
      if (order.isPending()) {
        // Si está pendiente, liberar stock reservado
        await this.releaseReservedStock(details);
      } else if (order.isConfirmed() || order.status === 'shipped') {
        // Si está confirmado o enviado, restaurar stock al inventario
        await this.restoreStockToInventory(details);
      }

      // Actualizar el estado del pedido a cancelado
      const cancelledOrder = await this.orderRepository.updateStatus(orderId, 'cancelled');

      return cancelledOrder;
    } catch (error) {
      throw new Error(`Error al cancelar el pedido: ${error.message}`);
    }
  }

  private async releaseReservedStock(details: Array<{
    productId: number;
    variantId: number | null;
    quantity: number;
  }>): Promise<void> {
    // Liberar el stock reservado para cada item
    for (const detail of details) {
      await this.inventoryRepository.releaseReservedStock(
        detail.productId,
        detail.variantId,
        detail.quantity
      );
    }
  }

  private async restoreStockToInventory(details: Array<{
    productId: number;
    variantId: number | null;
    quantity: number;
  }>): Promise<void> {
    // Restaurar el stock al inventario disponible
    const stockAdjustments = details.map(detail => ({
      productId: detail.productId,
      variantId: detail.variantId,
      quantity: detail.quantity, // Positivo para aumentar el stock
    }));

    await this.inventoryRepository.adjustMultipleStock(stockAdjustments);
  }
}
