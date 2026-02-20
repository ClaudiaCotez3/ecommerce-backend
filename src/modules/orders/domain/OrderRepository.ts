import { Order } from './Order';
import { OrderDetail } from './OrderDetail';

/**
 * Interfaz del repositorio de pedidos (Puerto del dominio)
 * Define las operaciones de persistencia para pedidos
 * NO depende de tecnologías específicas (Prisma, PostgreSQL, etc.)
 */
export interface OrderRepository {
  /**
   * Guarda un nuevo pedido
   */
  create(order: {
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
  }): Promise<Order>;

  /**
   * Busca un pedido por ID
   */
  findById(id: number): Promise<Order | null>;

  /**
   * Busca un pedido por ID con sus detalles
   */
  findByIdWithDetails(id: number): Promise<{ order: Order; details: OrderDetail[] } | null>;

  /**
   * Busca pedidos por tienda
   */
  findByShop(shopId: number): Promise<Order[]>;

  /**
   * Busca pedidos por tienda con sus detalles
   */
  findByShopWithDetails(shopId: number): Promise<{ order: Order; details: OrderDetail[] }[]>;

  /**
   * Busca pedidos por estado
   */
  findByStatus(status: string): Promise<Order[]>;

  /**
   * Busca pedidos por cliente
   */
  findByCustomer(customerName: string): Promise<Order[]>;

  /**
   * Actualiza el estado de un pedido
   */
  updateStatus(id: number, status: string): Promise<Order>;

  /**
   * Actualiza el total de un pedido
   */
  updateTotal(id: number, total: number): Promise<Order>;

  /**
   * Actualiza un pedido completo
   */
  update(id: number, data: Partial<{
    customerName: string;
    status: string;
    total: number;
    currency: string;
  }>): Promise<Order>;

  /**
   * Elimina un pedido
   */
  delete(id: number): Promise<void>;

  /**
   * Agrega un detalle a un pedido existente
   */
  addOrderDetail(
    orderId: number,
    detail: {
      productId: number;
      variantId: number | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }
  ): Promise<OrderDetail>;

  /**
   * Actualiza un detalle de pedido
   */
  updateOrderDetail(
    detailId: number,
    data: Partial<{
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>
  ): Promise<OrderDetail>;

  /**
   * Elimina un detalle de pedido
   */
  deleteOrderDetail(detailId: number): Promise<void>;

  /**
   * Obtiene los detalles de un pedido
   */
  getOrderDetails(orderId: number): Promise<OrderDetail[]>;

  /**
   * Verifica si un pedido pertenece a una tienda
   */
  orderBelongsToShop(orderId: number, shopId: number): Promise<boolean>;
}
