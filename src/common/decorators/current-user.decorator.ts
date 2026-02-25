import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para obtener el usuario actual desde el request
 * Incluye información de roles por tienda
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * Interface para el usuario en el contexto de request
 */
export interface CurrentUserData {
  id: string;
  email: string;
  name: string;
  shopMemberships?: Array<{
    shopId: number;
    roleId: number;
    roleName: string;
  }>;
}
