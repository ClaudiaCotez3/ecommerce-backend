import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../shops/infrastructure/AuthGuard';
import { PrismaService } from '../../auth/infrastructure/prisma.service';

/**
 * Controlador para operaciones generales de roles
 */
@Controller('roles')
@UseGuards(AuthGuard)
export class RolesController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /api/roles
   * Lista todos los roles disponibles en el sistema
   */
  @Get()
  async getAllRoles() {
    const roles = await this.prisma.role.findMany({
      orderBy: { id: 'asc' },
    });

    return {
      success: true,
      message: 'Roles obtenidos exitosamente',
      data: roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
      })),
    };
  }
}
