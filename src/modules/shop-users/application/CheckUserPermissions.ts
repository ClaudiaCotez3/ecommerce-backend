import { Injectable } from '@nestjs/common';
import type { ShopUserRepository } from '../domain/ShopUserRepository';

/**
 * Caso de uso: Verificar permisos de usuario en tienda
 * Usado por guards y middleware para autorización
 */
@Injectable()
export class CheckUserPermissions {
  constructor(private readonly shopUserRepository: ShopUserRepository) {}

  async execute(params: {
    userId: string;
    shopId: number;
    requiredRoles: string[];
  }): Promise<{
    hasPermission: boolean;
    userRole?: string;
    message?: string;
  }> {
    const { userId, shopId, requiredRoles } = params;

    // Buscar membresía con rol
    const membershipWithRole = await this.shopUserRepository.findMembershipWithRole(
      userId,
      shopId
    );

    if (!membershipWithRole) {
      return {
        hasPermission: false,
        message: 'Usuario no es miembro de esta tienda',
      };
    }

    const userRole = membershipWithRole.role.name.toLowerCase();
    const hasRequiredRole = requiredRoles.some(role => 
      role.toLowerCase() === userRole
    );

    return {
      hasPermission: hasRequiredRole,
      userRole: membershipWithRole.role.name,
      message: hasRequiredRole 
        ? 'Permisos válidos'
        : `Se requiere uno de estos roles: ${requiredRoles.join(', ')}`,
    };
  }

  /**
   * Verificación específica para administradores
   */
  async isAdmin(userId: string, shopId: number): Promise<boolean> {
    const result = await this.execute({
      userId,
      shopId,
      requiredRoles: ['admin', 'owner'],
    });

    return result.hasPermission;
  }

  /**
   * Verificación específica para gerentes o superior
   */
  async canManage(userId: string, shopId: number): Promise<boolean> {
    const result = await this.execute({
      userId,
      shopId,
      requiredRoles: ['admin', 'owner', 'manager'],
    });

    return result.hasPermission;
  }
}
