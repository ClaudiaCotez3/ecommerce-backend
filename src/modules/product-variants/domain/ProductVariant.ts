/**
 * Entidad de dominio ProductVariant
 * Representa una variante de producto como concepto de negocio
 * NO depende de Prisma ni NestJS
 */
export class ProductVariant {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly sku: string,
    public readonly specialPrice: number | null,
    public readonly attributes: Record<string, any>,
    public readonly status: string,
  ) {
    this.validateVariant();
  }

  private validateVariant(): void {
    if (!this.sku || this.sku.trim().length === 0) {
      throw new Error('El SKU es requerido');
    }

    if (!this.productId || this.productId <= 0) {
      throw new Error('La variante debe pertenecer a un producto válido');
    }

    if (this.specialPrice !== null && this.specialPrice <= 0) {
      throw new Error('El precio especial debe ser mayor a 0 si se proporciona');
    }

    if (this.sku.length > 100) {
      throw new Error('El SKU no puede exceder 100 caracteres');
    }
  }

  /**
   * Crea una nueva instancia de ProductVariant para creación
   */
  static create(
    productId: number,
    sku: string,
    specialPrice: number | null,
    attributes: Record<string, any>,
  ): {
    productId: number;
    sku: string;
    specialPrice: number | null;
    attributes: Record<string, any>;
    status: string;
  } {
    const status = 'active'; // Estado por defecto
    
    // Validaciones básicas antes de crear
    if (!sku || sku.trim().length === 0) {
      throw new Error('El SKU es requerido');
    }

    if (!productId || productId <= 0) {
      throw new Error('La variante debe pertenecer a un producto válido');
    }

    if (specialPrice !== null && specialPrice <= 0) {
      throw new Error('El precio especial debe ser mayor a 0 si se proporciona');
    }

    return {
      productId,
      sku: sku.trim().toUpperCase(), // Normalizar SKU
      specialPrice: specialPrice ? Number(specialPrice) : null,
      attributes: attributes || {},
      status,
    };
  }

  /**
   * Verifica si la variante está activa
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Verifica si la variante pertenece a un producto específico
   */
  belongsToProduct(productId: number): boolean {
    return this.productId === productId;
  }

  /**
   * Obtiene el precio efectivo (specialPrice o null si usa basePrice del producto)
   */
  getEffectivePrice(): number | null {
    return this.specialPrice;
  }

  /**
   * Obtiene un atributo específico
   */
  getAttribute(key: string): any {
    return this.attributes[key];
  }

  /**
   * Verifica si tiene un atributo específico
   */
  hasAttribute(key: string): boolean {
    return key in this.attributes;
  }
}
