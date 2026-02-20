import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository, InventoryRepository } from '../domain';
import { Order } from '../domain';
import { ORDER_REPOSITORY, INVENTORY_REPOSITORY } from '../tokens';

/**
 * Caso de uso: Confirmar un pedido
 * Cambia el estado de pendiente a confirmado y confirma la reserva de stock
 */
@Injectable()
export class ConfirmOrder {
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

    // Verificar que el pedido esté en estado pendiente
    if (!order.isPending()) {
      throw new Error('Solo se pueden confirmar pedidos pendientes');
    }

    // Verificar que el pedido tenga items
    if (details.length === 0) {
      throw new Error('No se puede confirmar un pedido sin items');
    }

    // Verificar que aún hay stock disponible para todos los items
    const stockValidation = await this.inventoryRepository.validateStockForItems(
      details.map(detail => ({
        productId: detail.productId,
        variantId: detail.variantId,
        quantity: detail.quantity,
      }))
    );

    if (!stockValidation.isValid) {
      const insufficientItemsDescription = stockValidation.insufficientItems
        .map(item => 
          `Producto ${item.productId}${item.variantId ? ` Variante ${item.variantId}` : ''}: ` +
          `solicitado ${item.requestedQuantity}, disponible ${item.availableStock}`
        )
        .join('; ');
      
      throw new Error(`Stock insuficiente para confirmar el pedido: ${insufficientItemsDescription}`);
    }

    try {
      // Confirmar el stock: quitar de disponible y liberar reservado
      await this.confirmStockForOrder(details);

      // Actualizar el estado del pedido a confirmado
      const confirmedOrder = await this.orderRepository.updateStatus(orderId, 'confirmed');

      return confirmedOrder;
    } catch (error) {
      // Si falla la confirmación de stock, mantener el pedido como pendiente
      throw new Error(`Error al confirmar el pedido: ${error.message}`);
    }
  }

  private async confirmStockForOrder(details: Array<{
    productId: number;
    variantId: number | null;
    quantity: number;
  }>): Promise<void> {
    // Procesar todos los items del pedido
    const stockAdjustments = details.map(detail => ({
      productId: detail.productId,
      variantId: detail.variantId,
      quantity: -detail.quantity, // Negativo para disminuir el stock
    }));

    try {
      // Ajustar el stock de todos los productos de una vez
      await this.inventoryRepository.adjustMultipleStock(stockAdjustments);

      // Liberar el stock reservado para cada item
      for (const detail of details) {
        await this.inventoryRepository.releaseReservedStock(
          detail.productId,
          detail.variantId,
          detail.quantity
        );
      }
    } catch (error) {
      // Si falla el ajuste de stock, intentar revertir los cambios
      try {
        // Revertir los ajustes de stock (agregar de vuelta lo que se quitó)
        const revertAdjustments = stockAdjustments.map(adj => ({
          ...adj,
          quantity: -adj.quantity, // Invertir el signo
        }));
        await this.inventoryRepository.adjustMultipleStock(revertAdjustments);
      } catch {
        // Si no se puede revertir, el sistema necesitará intervención manual
        console.error(`Error crítico: No se pudo revertir los cambios de stock para el pedido ${details[0]?.productId ? 'con productos' : 'sin identificación'}`);
      }
      
      throw error;
    }
  }
}
