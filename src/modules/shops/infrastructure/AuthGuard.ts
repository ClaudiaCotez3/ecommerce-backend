import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name?: string;
    shopMemberships?: Array<{
      shopId: number;
      roleId: number;
      roleName: string;
    }>;
  };
}

/**
 * Guard para proteger rutas que requieren autenticación
 * Valida el token JWT y añade la información del usuario al request
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    console.log('🔍 AuthGuard - Headers:', request.headers);
    console.log('🔍 AuthGuard - Authorization header:', authHeader);

    if (!authHeader) {
      console.log('❌ AuthGuard - No authorization header found');
      throw new UnauthorizedException('Token de acceso requerido');
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ AuthGuard - Invalid authorization format');
      throw new UnauthorizedException('Formato de autorización inválido. Debe ser: Bearer <token>');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔍 AuthGuard - Token extracted:', token.substring(0, 20) + '...');

    if (!token || token.trim().length === 0) {
      console.log('❌ AuthGuard - Empty token');
      throw new UnauthorizedException('Token de acceso requerido');
    }

    try {
      // Verificar el token JWT - usar la misma clave que auth
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      console.log('🔍 AuthGuard - Using JWT secret:', jwtSecret);
      
      const decoded = jwt.verify(token, jwtSecret) as any;
      console.log('✅ AuthGuard - Token decoded successfully:', { id: decoded.userId, email: decoded.email });
      
      // Añadir información del usuario al request
      // NOTA: El token de auth usa 'userId', no 'id'
      request.user = {
        id: decoded.userId, // Cambiar de 'id' a 'userId'
        email: decoded.email,
        name: decoded.name || decoded.firstName || 'Usuario',
        // Los roles se cargarán on-demand por el RolesGuard cuando sea necesario
      };

      return true;
    } catch (error) {
      console.log('❌ AuthGuard - Token verification failed:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('El token ha expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token malformado o inválido');
      } else {
        throw new UnauthorizedException('Token inválido o expirado');
      }
    }
  }
}
