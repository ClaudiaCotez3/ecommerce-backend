/**
 * Entidad de dominio Order
 * Representa un pedido como concepto de negocio
 * NO depende de Prisma ni NestJS
 */
export class Order {
  constructor(
    public readonly id: number,
    public readonly shopId: number,
    public readonly customerName: string,
    public readonly status: string,
    public readonly total: number,
    public readonly currency: string,
    public readonly createdAt: Date,
  ) {
    this.validateOrder();
  }

  private validateOrder(): void {
    if (!this.customerName || this.customerName.trim().length === 0) {
      throw new Error('El nombre del cliente es requerido');
    }

    if (!this.shopId || this.shopId <= 0) {
      throw new Error('El pedido debe pertenecer a una tienda válida');
    }

    if (this.total < 0) {
      throw new Error('El total del pedido no puede ser negativo');
    }

    if (!this.currency || this.currency.trim().length === 0) {
      throw new Error('La moneda es requerida');
    }

    if (this.customerName.length > 150) {
      throw new Error('El nombre del cliente no puede exceder 150 caracteres');
    }
  }

  /**
   * Crea una nueva instancia de Order para creación
   */
  static create(
    shopId: number,
    customerName: string,
    currency: string,
    total: number = 0,
  ): {
    shopId: number;
    customerName: string;
    status: string;
    total: number;
    currency: string;
  } {
    const status = 'pending'; // Estado por defecto
    
    // Validaciones básicas antes de crear
    if (!customerName || customerName.trim().length === 0) {
      throw new Error('El nombre del cliente es requerido');
    }

    if (!shopId || shopId <= 0) {
      throw new Error('El pedido debe pertenecer a una tienda válida');
    }

    if (total < 0) {
      throw new Error('El total del pedido no puede ser negativo');
    }

    if (!currency || currency.trim().length === 0) {
      throw new Error('La moneda es requerida');
    }

    return {
      shopId,
      customerName: customerName.trim(),
      status,
      total: Number(total),
      currency: currency.trim(),
    };
  }

  /**
   * Verifica si el pedido está pendiente
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Verifica si el pedido está confirmado
   */
  isConfirmed(): boolean {
    return this.status === 'confirmed';
  }

  /**
   * Verifica si el pedido está cancelado
   */
  isCanceled(): boolean {
    return this.status === 'canceled';
  }

  /**
   * Verifica si el pedido pertenece a una tienda específica
   */
  belongsToShop(shopId: number): boolean {
    return this.shopId === shopId;
  }

  /**
   * Verifica si el pedido puede ser confirmado
   */
  canBeConfirmed(): boolean {
    return this.isPending() && this.total > 0;
  }

  /**
   * Verifica si el pedido puede ser cancelado
   */
  canBeCanceled(): boolean {
    return this.isPending();
  }

  /**
   * Obtiene el estado del pedido
   */
  getStatus(): string {
    return this.status;
  }
}
