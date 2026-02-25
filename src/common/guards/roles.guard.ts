import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SHOP_CONTEXT_KEY } from '../decorators/shop-context.decorator';
import type { ShopUserRepository } from '../../modules/shop-users/domain/ShopUserRepository';

/**
 * Guard avanzado que verifica roles por tienda
 * Extiende el AuthGuard básico existente con autorización granular
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('ShopUserRepository') private shopUserRepository: ShopUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No hay roles requeridos, permite acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Obtener contexto de tienda
    const shopContextParam = this.reflector.getAllAndOverride<string>(SHOP_CONTEXT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || 'shopId';

    const shopId = this.extractShopId(request, shopContextParam);

    if (!shopId) {
      throw new ForbiddenException('Contexto de tienda requerido');
    }

    // Verificar membresía y rol en la tienda específica
    const membership = await this.shopUserRepository.findMembershipWithRole(
      user.id,
      parseInt(shopId)
    );

    if (!membership) {
      throw new ForbiddenException('No tienes acceso a esta tienda');
    }

    // Verificar si el rol del usuario coincide con los requeridos
    const hasRequiredRole = requiredRoles.some(role => 
      membership.role.name.toLowerCase() === role.toLowerCase()
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Necesitas uno de estos roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }

  private extractShopId(request: any, paramName: string): string | null {
    // Buscar en params de ruta
    if (request.params && request.params[paramName]) {
      return request.params[paramName];
    }

    // Buscar en query parameters
    if (request.query && request.query[paramName]) {
      return request.query[paramName];
    }

    // Buscar en body
    if (request.body && request.body[paramName]) {
      return request.body[paramName];
    }

    return null;
  }
}
