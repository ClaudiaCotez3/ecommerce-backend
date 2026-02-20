/**
 * Interfaz para acceder al inventario desde el dominio de pedidos
 * Define las operaciones necesarias para gestionar stock al crear/confirmar pedidos
 * NO depende de tecnologías específicas (Prisma, PostgreSQL, etc.)
 */
export interface InventoryRepository {
  /**
   * Obtiene el stock disponible de un producto/variante
   */
  getAvailableStock(productId: number, variantId: number | null): Promise<number>;

  /**
   * Verifica si hay suficiente stock para una cantidad solicitada
   */
  hasEnoughStock(productId: number, variantId: number | null, quantity: number): Promise<boolean>;

  /**
   * Disminuye el stock de un producto/variante
   * Útil cuando se confirma un pedido
   */
  decreaseStock(productId: number, variantId: number | null, quantity: number): Promise<void>;

  /**
   * Aumenta el stock de un producto/variante
   * Útil cuando se cancela un pedido confirmado
   */
  increaseStock(productId: number, variantId: number | null, quantity: number): Promise<void>;

  /**
   * Reserva stock temporalmente (para pedidos pendientes)
   */
  reserveStock(productId: number, variantId: number | null, quantity: number): Promise<void>;

  /**
   * Libera stock reservado (cuando se cancela un pedido pendiente)
   */
  releaseReservedStock(productId: number, variantId: number | null, quantity: number): Promise<void>;

  /**
   * Verifica que todos los productos de una lista tengan stock suficiente
   */
  validateStockForItems(items: {
    productId: number;
    variantId: number | null;
    quantity: number;
  }[]): Promise<{
    isValid: boolean;
    insufficientItems: {
      productId: number;
      variantId: number | null;
      requestedQuantity: number;
      availableStock: number;
    }[];
  }>;

  /**
   * Ajusta el stock de múltiples productos/variantes de una vez
   * Útil para procesar todos los items de un pedido
   */
  adjustMultipleStock(adjustments: {
    productId: number;
    variantId: number | null;
    quantity: number; // Positivo para aumentar, negativo para disminuir
  }[]): Promise<void>;
}
