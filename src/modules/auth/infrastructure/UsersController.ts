import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../shops/infrastructure/AuthGuard';
import { PrismaService } from '../infrastructure/prisma.service';

/**
 * Controlador para operaciones de usuarios
 */
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /api/users
   * Lista todos los usuarios (para propósitos de testing)
   */
  @Get()
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: users,
      total: users.length,
    };
  }
}
