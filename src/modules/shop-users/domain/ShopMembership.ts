/**
 * Entidad de dominio ShopMembership
 * Representa la pertenencia de un usuario a una shop con un role específico
 * NO depende de Prisma ni NestJS
 */
export class ShopMembership {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly shopId: number,
    public readonly roleId: number,
    public readonly assignedAt: Date,
  ) {
    this.validateMembership();
  }

  private validateMembership(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error('El ID del usuario es requerido');
    }

    if (!this.shopId || this.shopId <= 0) {
      throw new Error('El ID de la tienda debe ser un número válido');
    }

    if (!this.roleId || this.roleId <= 0) {
      throw new Error('El ID del rol debe ser un número válido');
    }
  }

  /**
   * Crea una nueva instancia de ShopMembership para creación
   */
  static create(
    userId: string,
    shopId: number,
    roleId: number,
  ): {
    userId: string;
    shopId: number;
    roleId: number;
  } {
    // Validaciones básicas antes de crear
    if (!userId || userId.trim().length === 0) {
      throw new Error('El ID del usuario es requerido');
    }

    if (!shopId || shopId <= 0) {
      throw new Error('El ID de la tienda debe ser un número válido');
    }

    if (!roleId || roleId <= 0) {
      throw new Error('El ID del rol debe ser un número válido');
    }

    return {
      userId: userId.trim(),
      shopId,
      roleId,
    };
  }

  /**
   * Verifica si esta membresía pertenece al usuario especificado
   */
  belongsToUser(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Verifica si esta membresía pertenece a la tienda especificada
   */
  belongsToShop(shopId: number): boolean {
    return this.shopId === shopId;
  }

  /**
   * Verifica si el usuario tiene el rol especificado
   */
  hasRole(roleId: number): boolean {
    return this.roleId === roleId;
  }

  /**
   * Crea una nueva instancia con un rol actualizado
   */
  withNewRole(newRoleId: number): {
    userId: string;
    shopId: number;
    roleId: number;
  } {
    if (!newRoleId || newRoleId <= 0) {
      throw new Error('El nuevo ID del rol debe ser un número válido');
    }

    return {
      userId: this.userId,
      shopId: this.shopId,
      roleId: newRoleId,
    };
  }
}
