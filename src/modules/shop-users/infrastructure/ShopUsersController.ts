import { 
  Controller, 
  Post, 
  Get, 
  Patch,
  Param,
  Body, 
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssignUserToShop, AssignUserToShopInput } from '../application/AssignUserToShop';
import { ChangeUserRoleInShop, ChangeUserRoleInput } from '../application/ChangeUserRoleInShop';
import { ListShopMembers } from '../application/ListShopMembers';
import { AuthGuard } from '../../shops/infrastructure/AuthGuard';

/**
 * DTO para asignar usuario a shop
 */
export class AssignUserToShopDto {
  userId: string;
  roleId: number;
}

/**
 * DTO para cambiar rol de usuario
 */
export class ChangeRoleDto {
  roleId: number;
}

/**
 * Controlador REST para operaciones de ShopUsers/Memberships
 * NO contiene lógica de negocio, solo coordina requests
 */
@Controller('shops/:shopId/members')
@UseGuards(AuthGuard)
export class ShopUsersController {
  constructor(
    private readonly assignUserToShop: AssignUserToShop,
    private readonly changeUserRoleInShop: ChangeUserRoleInShop,
    private readonly listShopMembers: ListShopMembers,
  ) {}

  /**
   * POST /api/shops/:shopId/members
   * Asigna un usuario a la shop con un rol específico
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async assignUser(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body() assignDto: AssignUserToShopDto,
  ) {
    const input: AssignUserToShopInput = {
      userId: assignDto.userId,
      shopId: shopId,
      roleId: assignDto.roleId,
    };

    const membership = await this.assignUserToShop.execute(input);

    return {
      success: true,
      message: 'Usuario asignado a la tienda exitosamente',
      data: {
        id: membership.id,
        userId: membership.userId,
        shopId: membership.shopId,
        roleId: membership.roleId,
        assignedAt: membership.assignedAt,
      },
    };
  }

  /**
   * PATCH /api/shops/:shopId/members/:userId/role
   * Cambia el rol del usuario en la shop
   */
  @Patch(':userId/role')
  async changeUserRole(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string,
    @Body() changeRoleDto: ChangeRoleDto,
  ) {
    const input: ChangeUserRoleInput = {
      userId: userId,
      shopId: shopId,
      roleId: changeRoleDto.roleId,
    };

    const updatedMembership = await this.changeUserRoleInShop.execute(input);

    return {
      success: true,
      message: 'Rol del usuario actualizado exitosamente',
      data: {
        id: updatedMembership.id,
        userId: updatedMembership.userId,
        shopId: updatedMembership.shopId,
        roleId: updatedMembership.roleId,
        assignedAt: updatedMembership.assignedAt,
      },
    };
  }

  /**
   * GET /api/shops/:shopId/members
   * Lista todos los miembros de la shop con sus roles
   */
  @Get()
  async getMembers(@Param('shopId', ParseIntPipe) shopId: number) {
    const members = await this.listShopMembers.execute({ shopId });

    return {
      success: true,
      message: 'Miembros obtenidos exitosamente',
      data: members.map(member => ({
        membership: {
          id: member.membership.id,
          userId: member.membership.userId,
          shopId: member.membership.shopId,
          roleId: member.membership.roleId,
          assignedAt: member.membership.assignedAt,
        },
        user: {
          email: member.userEmail,
          name: member.userName,
        },
        role: {
          name: member.roleName,
        },
        shop: {
          name: member.shopName,
        },
      })),
      total: members.length,
    };
  }
}
