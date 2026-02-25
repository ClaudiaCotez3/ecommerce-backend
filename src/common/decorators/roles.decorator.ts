import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para definir roles requeridos en endpoints
 * Uso: @Roles('admin', 'manager')
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
