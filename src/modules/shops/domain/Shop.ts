/**
 * Entidad de dominio Shop
 * Representa una tienda como concepto de negocio
 * NO depende de Prisma ni NestJS
 */
export class Shop {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly currency: string,
    public readonly status: string,
    public readonly ownerId: string,
    public readonly createdAt: Date,
  ) {
    this.validateShop();
  }

  private validateShop(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre de la tienda es requerido');
    }

    if (!this.currency || this.currency.trim().length === 0) {
      throw new Error('La moneda de la tienda es requerida');
    }

    if (!this.ownerId || this.ownerId.trim().length === 0) {
      throw new Error('El propietario de la tienda es requerido');
    }

    if (this.name.length > 150) {
      throw new Error('El nombre de la tienda no puede exceder 150 caracteres');
    }

    if (this.currency.length > 10) {
      throw new Error('La moneda no puede exceder 10 caracteres');
    }
  }

  /**
   * Crea una nueva instancia de Shop para creación
   */
  static create(
    name: string,
    slug: string,
    description: string | null,
    currency: string,
    ownerId: string,
  ): {
    name: string;
    slug: string;
    description: string | null;
    currency: string;
    status: string;
    ownerId: string;
  } {
    const status = 'active'; // Estado por defecto
    
    // Validaciones básicas antes de crear
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre de la tienda es requerido');
    }

    if (!currency || currency.trim().length === 0) {
      throw new Error('La moneda de la tienda es requerida');
    }

    if (!ownerId || ownerId.trim().length === 0) {
      throw new Error('El propietario de la tienda es requerido');
    }

    return {
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
      currency: currency.trim().toUpperCase(),
      status,
      ownerId: ownerId.trim(),
    };
  }

  /**
   * Verifica si la tienda está activa
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Verifica si el usuario es propietario de la tienda
   */
  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }
}
