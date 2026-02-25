import { Controller, Post, Body, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '../../shops/infrastructure/AuthGuard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ShopContext } from '../../../common/decorators/shop-context.decorator';
import { CurrentUser, type CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { AssignRoleToUser } from '../application/AssignRoleToUser';
import { CheckUserPermissions } from '../application/CheckUserPermissions';

/**
 * Controlador para gestión de roles y permisos por tienda
 */
@Controller('shop-users')
@UseGuards(AuthGuard)
export class ShopUserController {
  constructor(
    private readonly assignRoleToUser: AssignRoleToUser,
    private readonly checkUserPermissions: CheckUserPermissions,
  ) {}

  /**
   * Asignar rol a usuario en tienda específica
   * Solo admins/owners pueden asignar roles
   */
  @Post('assign-role')
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @ShopContext('shopId')
  async assignRole(
    @Body() body: {
      userId: string;
      shopId: number;
      roleId: number;
    },
    @CurrentUser() currentUser: CurrentUserData
  ) {
    const membership = await this.assignRoleToUser.execute({
      userId: body.userId,
      shopId: body.shopId,
      roleId: body.roleId,
      assignedByUserId: currentUser.id,
    });

    return {
      success: true,
      message: 'Rol asignado exitosamente',
      data: membership,
    };
  }

  /**
   * Verificar permisos de usuario en tienda
   */
  @Get('check-permissions/:shopId/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'manager')
  @ShopContext()
  async checkPermissions(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string,
    @Body() body?: { requiredRoles?: string[] }
  ) {
    const requiredRoles = body?.requiredRoles || ['employee'];
    
    const result = await this.checkUserPermissions.execute({
      userId,
      shopId,
      requiredRoles,
    });

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Verificar si un usuario es admin de la tienda
   */
  @Get('is-admin/:shopId/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @ShopContext()
  async isAdmin(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string
  ) {
    const isAdmin = await this.checkUserPermissions.isAdmin(userId, shopId);

    return {
      success: true,
      data: { isAdmin },
    };
  }
}
