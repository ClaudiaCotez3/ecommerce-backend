import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository } from '../domain';
import { OrderDetail } from '../domain';
import { ORDER_REPOSITORY } from '../tokens';

/**
 * Caso de uso: Agregar un item a un pedido existente
 * Valida que el pedido esté en estado pendiente y agrega el nuevo item
 */
@Injectable()
export class AddItemToOrder {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(data: {
    orderId: number;
    productId: number;
    variantId: number | null;
    quantity: number;
    unitPrice: number;
  }): Promise<OrderDetail> {
    // Validaciones básicas
    this.validateInput(data);

    // Verificar que el pedido existe
    const order = await this.orderRepository.findById(data.orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    // Verificar que el pedido esté en estado pendiente
    if (!order.isPending()) {
      throw new Error('Solo se pueden agregar items a pedidos pendientes');
    }

    // Verificar si ya existe este producto/variante en el pedido
    const existingDetails = await this.orderRepository.getOrderDetails(data.orderId);
    const existingItem = existingDetails.find(detail => 
      detail.isForProduct(data.productId) && detail.isForVariant(data.variantId)
    );

    if (existingItem) {
      throw new Error('Este producto/variante ya existe en el pedido. Use actualizar cantidad en su lugar.');
    }

    // Crear el detalle
    const detailData = OrderDetail.create(
      data.orderId,
      data.productId,
      data.variantId,
      data.quantity,
      data.unitPrice
    );

    // Agregar el detalle al pedido
    const newDetail = await this.orderRepository.addOrderDetail(data.orderId, detailData);

    // Recalcular y actualizar el total del pedido
    await this.recalculateOrderTotal(data.orderId);

    return newDetail;
  }

  private validateInput(data: {
    orderId: number;
    productId: number;
    variantId: number | null;
    quantity: number;
    unitPrice: number;
  }): void {
    if (!data.orderId || data.orderId <= 0) {
      throw new Error('ID de pedido inválido');
    }

    if (!data.productId || data.productId <= 0) {
      throw new Error('ID de producto inválido');
    }

    if (data.quantity <= 0 || !Number.isInteger(data.quantity)) {
      throw new Error('La cantidad debe ser un número entero positivo');
    }

    if (data.quantity > 1000) {
      throw new Error('La cantidad no puede exceder 1000 unidades');
    }

    if (data.unitPrice < 0) {
      throw new Error('El precio unitario no puede ser negativo');
    }

    if (data.unitPrice > 999999.99) {
      throw new Error('El precio unitario no puede exceder $999,999.99');
    }
  }

  private async recalculateOrderTotal(orderId: number): Promise<void> {
    // Obtener todos los detalles del pedido
    const details = await this.orderRepository.getOrderDetails(orderId);
    
    // Calcular el nuevo total
    const newTotal = details.reduce((sum, detail) => sum + detail.subtotal, 0);

    // Actualizar el total del pedido
    await this.orderRepository.updateTotal(orderId, Number(newTotal.toFixed(2)));
  }
}
