/**
 * Entidad de dominio OrderDetail
 * Representa un detalle/línea de pedido como concepto de negocio
 * NO depende de Prisma ni NestJS
 */
export class OrderDetail {
  constructor(
    public readonly id: number,
    public readonly orderId: number,
    public readonly productId: number,
    public readonly variantId: number | null,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly subtotal: number,
  ) {
    this.validateOrderDetail();
  }

  private validateOrderDetail(): void {
    if (!this.orderId || this.orderId <= 0) {
      throw new Error('El detalle debe pertenecer a un pedido válido');
    }

    if (!this.productId || this.productId <= 0) {
      throw new Error('El detalle debe referenciar un producto válido');
    }

    if (this.quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    if (this.unitPrice < 0) {
      throw new Error('El precio unitario no puede ser negativo');
    }

    if (this.subtotal < 0) {
      throw new Error('El subtotal no puede ser negativo');
    }

    // Validar que el subtotal sea correcto
    const calculatedSubtotal = this.quantity * this.unitPrice;
    if (Math.abs(this.subtotal - calculatedSubtotal) > 0.01) {
      throw new Error('El subtotal no coincide con la cantidad por precio unitario');
    }
  }

  /**
   * Crea una nueva instancia de OrderDetail para creación
   */
  static create(
    orderId: number,
    productId: number,
    variantId: number | null,
    quantity: number,
    unitPrice: number,
  ): {
    orderId: number;
    productId: number;
    variantId: number | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  } {
    // Validaciones básicas antes de crear
    if (!orderId || orderId <= 0) {
      throw new Error('El detalle debe pertenecer a un pedido válido');
    }

    if (!productId || productId <= 0) {
      throw new Error('El detalle debe referenciar un producto válido');
    }

    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    if (unitPrice < 0) {
      throw new Error('El precio unitario no puede ser negativo');
    }

    if (!Number.isInteger(quantity)) {
      throw new Error('La cantidad debe ser un número entero');
    }

    const subtotal = Number((quantity * unitPrice).toFixed(2));

    return {
      orderId,
      productId,
      variantId,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      subtotal,
    };
  }

  /**
   * Crea un detalle temporal para cálculos antes de tener el orderId
   * Se usa durante la creación del pedido, antes de persistir
   */
  static createForNewOrder(
    productId: number,
    variantId: number | null,
    quantity: number,
    unitPrice: number,
  ): {
    productId: number;
    variantId: number | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  } {
    // Validaciones básicas (sin validar orderId)
    if (!productId || productId <= 0) {
      throw new Error('El detalle debe referenciar un producto válido');
    }

    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    if (unitPrice < 0) {
      throw new Error('El precio unitario no puede ser negativo');
    }

    if (!Number.isInteger(quantity)) {
      throw new Error('La cantidad debe ser un número entero');
    }

    const subtotal = Number((quantity * unitPrice).toFixed(2));

    return {
      productId,
      variantId,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      subtotal,
    };
  }

  /**
   * Verifica si el detalle pertenece a un pedido específico
   */
  belongsToOrder(orderId: number): boolean {
    return this.orderId === orderId;
  }

  /**
   * Verifica si el detalle corresponde a un producto específico
   */
  isForProduct(productId: number): boolean {
    return this.productId === productId;
  }

  /**
   * Verifica si el detalle corresponde a una variante específica
   */
  isForVariant(variantId: number | null): boolean {
    return this.variantId === variantId;
  }

  /**
   * Verifica si este detalle es el mismo producto/variante que otro
   */
  isSameItem(productId: number, variantId: number | null): boolean {
    return this.productId === productId && this.variantId === variantId;
  }

  /**
   * Calcula el subtotal basado en cantidad y precio unitario
   */
  calculateSubtotal(): number {
    return Number((this.quantity * this.unitPrice).toFixed(2));
  }
}
