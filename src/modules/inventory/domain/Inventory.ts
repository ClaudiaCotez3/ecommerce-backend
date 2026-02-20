/**
 * Entidad de dominio Inventory
 * Representa el inventario de una variante de producto
 * NO depende de Prisma ni NestJS
 */
export class Inventory {
  constructor(
    public readonly id: number,
    public readonly variantId: number,
    public readonly quantity: number,
    public readonly minStockAlert: number,
    public readonly updatedAt: Date,
  ) {
    this.validateInventory();
  }

  private validateInventory(): void {
    if (!this.variantId || this.variantId <= 0) {
      throw new Error('El inventario debe pertenecer a una variante válida');
    }

    if (this.quantity < 0) {
      throw new Error('La cantidad en inventario no puede ser negativa');
    }

    if (this.minStockAlert < 0) {
      throw new Error('La alerta de stock mínimo no puede ser negativa');
    }
  }

  /**
   * Crea una nueva instancia de Inventory para creación
   */
  static create(
    variantId: number,
    quantity: number = 0,
    minStockAlert: number = 0,
  ): {
    variantId: number;
    quantity: number;
    minStockAlert: number;
  } {
    // Validaciones básicas antes de crear
    if (!variantId || variantId <= 0) {
      throw new Error('El inventario debe pertenecer a una variante válida');
    }

    if (quantity < 0) {
      throw new Error('La cantidad inicial no puede ser negativa');
    }

    if (minStockAlert < 0) {
      throw new Error('La alerta de stock mínimo no puede ser negativa');
    }

    return {
      variantId,
      quantity: Number(quantity),
      minStockAlert: Number(minStockAlert),
    };
  }

  /**
   * Verifica si el stock está disponible
   */
  hasStock(): boolean {
    return this.quantity > 0;
  }

  /**
   * Verifica si el stock está por debajo del mínimo
   */
  isLowStock(): boolean {
    return this.quantity <= this.minStockAlert;
  }

  /**
   * Verifica si hay suficiente stock para una cantidad específica
   */
  hasSufficientStock(requiredQuantity: number): boolean {
    return this.quantity >= requiredQuantity;
  }

  /**
   * Calcula la nueva cantidad después de una actualización
   */
  calculateNewQuantity(change: number): number {
    const newQuantity = this.quantity + change;
    
    if (newQuantity < 0) {
      throw new Error('La operación resultaría en stock negativo');
    }

    return newQuantity;
  }

  /**
   * Verifica si la variante pertenece al inventario
   */
  belongsToVariant(variantId: number): boolean {
    return this.variantId === variantId;
  }

  /**
   * Obtiene el estado del stock
   */
  getStockStatus(): 'out_of_stock' | 'low_stock' | 'in_stock' {
    if (this.quantity === 0) return 'out_of_stock';
    if (this.isLowStock()) return 'low_stock';
    return 'in_stock';
  }
}
