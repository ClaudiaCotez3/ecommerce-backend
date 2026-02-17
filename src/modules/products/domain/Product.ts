/**
 * Entidad de dominio Product
 * Representa un producto como concepto de negocio
 * NO depende de Prisma ni NestJS
 */
export class Product {
  constructor(
    public readonly id: number,
    public readonly shopId: number,
    public readonly name: string,
    public readonly description: string | null,
    public readonly basePrice: number,
    public readonly status: string,
    public readonly createdAt: Date,
  ) {
    this.validateProduct();
  }

  private validateProduct(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre del producto es requerido');
    }

    if (this.basePrice <= 0) {
      throw new Error('El precio base debe ser mayor a 0');
    }

    if (!this.shopId || this.shopId <= 0) {
      throw new Error('El producto debe pertenecer a una tienda válida');
    }

    if (this.name.length > 150) {
      throw new Error('El nombre del producto no puede exceder 150 caracteres');
    }
  }

  /**
   * Crea una nueva instancia de Product para creación
   */
  static create(
    shopId: number,
    name: string,
    description: string | null,
    basePrice: number,
  ): {
    shopId: number;
    name: string;
    description: string | null;
    basePrice: number;
    status: string;
  } {
    const status = 'active'; // Estado por defecto
    
    // Validaciones básicas antes de crear
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre del producto es requerido');
    }

    if (basePrice <= 0) {
      throw new Error('El precio base debe ser mayor a 0');
    }

    if (!shopId || shopId <= 0) {
      throw new Error('El producto debe pertenecer a una tienda válida');
    }

    return {
      shopId,
      name: name.trim(),
      description: description?.trim() || null,
      basePrice: Number(basePrice),
      status,
    };
  }

  /**
   * Verifica si el producto está activo
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Verifica si el producto pertenece a una tienda específica
   */
  belongsToShop(shopId: number): boolean {
    return this.shopId === shopId;
  }

  /**
   * Actualiza los campos editables del producto
   */
  updateFields(data: {
    name?: string;
    description?: string | null;
    basePrice?: number;
    status?: string;
  }): {
    name?: string;
    description?: string | null;
    basePrice?: number;
    status?: string;
  } {
    const updateData: any = {};

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('El nombre del producto es requerido');
      }
      if (data.name.length > 150) {
        throw new Error('El nombre del producto no puede exceder 150 caracteres');
      }
      updateData.name = data.name.trim();
    }

    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }

    if (data.basePrice !== undefined) {
      if (data.basePrice <= 0) {
        throw new Error('El precio base debe ser mayor a 0');
      }
      updateData.basePrice = Number(data.basePrice);
    }

    if (data.status !== undefined) {
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(data.status)) {
        throw new Error(`Estado inválido. Estados válidos: ${validStatuses.join(', ')}`);
      }
      updateData.status = data.status;
    }

    return updateData;
  }
}
