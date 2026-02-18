/**
 * Entidad de dominio Category
 * Representa una categoría como concepto de negocio
 * NO depende de Prisma ni NestJS
 */
export class Category {
  constructor(
    public readonly id: number,
    public readonly shopId: number,
    public readonly name: string,
    public readonly description: string | null,
  ) {
    this.validateCategory();
  }

  private validateCategory(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre de la categoría es requerido');
    }

    if (!this.shopId || this.shopId <= 0) {
      throw new Error('La categoría debe pertenecer a una tienda válida');
    }

    if (this.name.length > 100) {
      throw new Error('El nombre de la categoría no puede exceder 100 caracteres');
    }
  }

  /**
   * Crea una nueva instancia de Category para creación
   */
  static create(
    shopId: number,
    name: string,
    description: string | null,
  ): {
    shopId: number;
    name: string;
    description: string | null;
  } {
    // Validaciones básicas antes de crear
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre de la categoría es requerido');
    }

    if (!shopId || shopId <= 0) {
      throw new Error('La categoría debe pertenecer a una tienda válida');
    }

    if (name.length > 100) {
      throw new Error('El nombre de la categoría no puede exceder 100 caracteres');
    }

    return {
      shopId,
      name: name.trim(),
      description: description?.trim() || null,
    };
  }

  /**
   * Verifica si la categoría pertenece a una tienda específica
   */
  belongsToShop(shopId: number): boolean {
    return this.shopId === shopId;
  }

  /**
   * Verifica si el nombre de la categoría coincide (case-insensitive)
   */
  hasName(name: string): boolean {
    return this.name.toLowerCase() === name.trim().toLowerCase();
  }
}
