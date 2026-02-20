import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { OrderRepository, Order, OrderDetail } from '../domain';

/**
 * Implementación de Prisma para OrderRepository
 * Adapta las operaciones del dominio a Prisma
 */
@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(order: {
    id?: number;
    shopId: number;
    customerName: string;
    status: string;
    total: number;
    currency: string;
    orderDetails: {
      productId: number;
      variantId: number | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[];
  }): Promise<Order> {
    const createdOrder = await this.prisma.order.create({
      data: {
        shopId: order.shopId,
        customerName: order.customerName,
        status: order.status,
        total: order.total,
        currency: order.currency,
        orderDetails: {
          create: order.orderDetails.map(detail => ({
            productId: detail.productId,
            variantId: detail.variantId,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            subtotal: detail.subtotal,
          }))
        }
      },
    });

    return new Order(
      createdOrder.id,
      createdOrder.shopId,
      createdOrder.customerName,
      createdOrder.status,
      Number(createdOrder.total),
      createdOrder.currency,
      createdOrder.createdAt,
    );
  }

  async findById(id: number): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return null;
    }

    return new Order(
      order.id,
      order.shopId,
      order.customerName,
      order.status,
      Number(order.total),
      order.currency,
      order.createdAt,
    );
  }

  async findByIdWithDetails(id: number): Promise<{ order: Order; details: OrderDetail[] } | null> {
    const orderData = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderDetails: true,
      },
    });

    if (!orderData) {
      return null;
    }

    const order = new Order(
      orderData.id,
      orderData.shopId,
      orderData.customerName,
      orderData.status,
      Number(orderData.total),
      orderData.currency,
      orderData.createdAt,
    );

    const details = orderData.orderDetails.map(detail => new OrderDetail(
      detail.id,
      detail.orderId,
      detail.productId,
      detail.variantId,
      detail.quantity,
      Number(detail.unitPrice),
      Number(detail.subtotal),
    ));

    return { order, details };
  }

  async findByShop(shopId: number): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => new Order(
      order.id,
      order.shopId,
      order.customerName,
      order.status,
      Number(order.total),
      order.currency,
      order.createdAt,
    ));
  }

  async findByShopWithDetails(shopId: number): Promise<{ order: Order; details: OrderDetail[] }[]> {
    const ordersData = await this.prisma.order.findMany({
      where: { shopId },
      include: {
        orderDetails: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ordersData.map(orderData => ({
      order: new Order(
        orderData.id,
        orderData.shopId,
        orderData.customerName,
        orderData.status,
        Number(orderData.total),
        orderData.currency,
        orderData.createdAt,
      ),
      details: orderData.orderDetails.map(detail => new OrderDetail(
        detail.id,
        detail.orderId,
        detail.productId,
        detail.variantId,
        detail.quantity,
        Number(detail.unitPrice),
        Number(detail.subtotal),
      ))
    }));
  }

  async findByStatus(status: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => new Order(
      order.id,
      order.shopId,
      order.customerName,
      order.status,
      Number(order.total),
      order.currency,
      order.createdAt,
    ));
  }

  async findByCustomer(customerName: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { 
        customerName: {
          contains: customerName,
          mode: 'insensitive',
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => new Order(
      order.id,
      order.shopId,
      order.customerName,
      order.status,
      Number(order.total),
      order.currency,
      order.createdAt,
    ));
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status },
    });

    return new Order(
      updatedOrder.id,
      updatedOrder.shopId,
      updatedOrder.customerName,
      updatedOrder.status,
      Number(updatedOrder.total),
      updatedOrder.currency,
      updatedOrder.createdAt,
    );
  }

  async updateTotal(id: number, total: number): Promise<Order> {
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { total },
    });

    return new Order(
      updatedOrder.id,
      updatedOrder.shopId,
      updatedOrder.customerName,
      updatedOrder.status,
      Number(updatedOrder.total),
      updatedOrder.currency,
      updatedOrder.createdAt,
    );
  }

  async update(id: number, data: Partial<{
    customerName: string;
    status: string;
    total: number;
    currency: string;
  }>): Promise<Order> {
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data,
    });

    return new Order(
      updatedOrder.id,
      updatedOrder.shopId,
      updatedOrder.customerName,
      updatedOrder.status,
      Number(updatedOrder.total),
      updatedOrder.currency,
      updatedOrder.createdAt,
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.order.delete({
      where: { id },
    });
  }

  async addOrderDetail(
    orderId: number,
    detail: {
      productId: number;
      variantId: number | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }
  ): Promise<OrderDetail> {
    const createdDetail = await this.prisma.orderDetail.create({
      data: {
        orderId,
        productId: detail.productId,
        variantId: detail.variantId,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal,
      },
    });

    return new OrderDetail(
      createdDetail.id,
      createdDetail.orderId,
      createdDetail.productId,
      createdDetail.variantId,
      createdDetail.quantity,
      Number(createdDetail.unitPrice),
      Number(createdDetail.subtotal),
    );
  }

  async updateOrderDetail(
    detailId: number,
    data: Partial<{
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>
  ): Promise<OrderDetail> {
    const updatedDetail = await this.prisma.orderDetail.update({
      where: { id: detailId },
      data,
    });

    return new OrderDetail(
      updatedDetail.id,
      updatedDetail.orderId,
      updatedDetail.productId,
      updatedDetail.variantId,
      updatedDetail.quantity,
      Number(updatedDetail.unitPrice),
      Number(updatedDetail.subtotal),
    );
  }

  async deleteOrderDetail(detailId: number): Promise<void> {
    await this.prisma.orderDetail.delete({
      where: { id: detailId },
    });
  }

  async getOrderDetails(orderId: number): Promise<OrderDetail[]> {
    const details = await this.prisma.orderDetail.findMany({
      where: { orderId },
      orderBy: { id: 'asc' },
    });

    return details.map(detail => new OrderDetail(
      detail.id,
      detail.orderId,
      detail.productId,
      detail.variantId,
      detail.quantity,
      Number(detail.unitPrice),
      Number(detail.subtotal),
    ));
  }

  async orderBelongsToShop(orderId: number, shopId: number): Promise<boolean> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        shopId: shopId,
      },
    });

    return !!order;
  }
}
