import { 
  Controller, 
  Get,
  Patch,
  Body, 
  Param,
  Inject,
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import type { UpdateStockInput } from '../application/UpdateStock';
import { UpdateStock } from '../application/UpdateStock';
import type { AdjustStockInput } from '../application/AdjustStock';
import { AdjustStock } from '../application/AdjustStock';
import type { GetInventoryByVariantInput } from '../application/GetInventoryByVariant';
import { GetInventoryByVariant } from '../application/GetInventoryByVariant';
import { AuthGuard } from '../../shops/infrastructure/AuthGuard';
import type { AuthenticatedRequest } from '../../shops/infrastructure/AuthGuard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ShopContext } from '../../../common/decorators/shop-context.decorator';
import { CurrentUser, type CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../auth/infrastructure/prisma.service';
import type { ShopUserRepository } from '../../shop-users/domain/ShopUserRepository';

/**
 * DTO para actualizar stock
 */
export class UpdateStockDto {
  quantity: number;
  minStockAlert?: number;
}

/**
 * DTO para ajustar stock
 */
export class AdjustStockDto {
  adjustment: number;
  reason: string;
}

/**
 * Controlador REST para operaciones de Inventory
 * NO contiene lógica de negocio, solo coordina requests
 */
@Controller()
@UseGuards(AuthGuard)
export class InventoryController {
  constructor(
    private readonly updateStock: UpdateStock,
    private readonly adjustStock: AdjustStock,
    private readonly getInventoryByVariant: GetInventoryByVariant,
    private readonly prisma: PrismaService,
    @Inject('ShopUserRepository') private readonly shopUserRepository: ShopUserRepository,
  ) {}

  /**
   * GET /api/shops/:shopId/variants/:variantId/inventory
   * Obtiene el inventario de una variante específica
   */
  @Get('shops/:shopId/variants/:variantId/inventory')
  async getVariantInventory(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    // Verificar que la variante pertenece a la tienda especificada
    const variant = await this.prisma.productVariant.findFirst({
      where: { 
        id: variantId,
        product: {
          shopId: shopId
        }
      }
    });

    if (!variant) {
      return {
        success: false,
        message: 'Variante no encontrada en esta tienda'
      };
    }

    // Verificar permisos en la tienda (todos los miembros pueden ver inventario)
    const membership = await this.shopUserRepository.findMembershipWithRole(
      currentUser.id,
      shopId
    );

    if (!membership) {
      return {
        success: false,
        message: 'No tienes acceso a esta tienda'
      };
    }
    
    const input: GetInventoryByVariantInput = { variantId };
    const inventory = await this.getInventoryByVariant.execute(input);

    if (!inventory) {
      return {
        success: true,
        message: 'No hay inventario registrado para esta variante',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Inventario obtenido exitosamente',
      data: {
        id: inventory.id,
        variantId: inventory.variantId,
        quantity: inventory.quantity,
        minStockAlert: inventory.minStockAlert,
        hasStock: inventory.hasStock(),
        isLowStock: inventory.isLowStock(),
        stockStatus: inventory.getStockStatus(),
        updatedAt: inventory.updatedAt,
      },
    };
  }

  /**
   * PATCH /api/shops/:shopId/variants/:variantId/stock
   * Actualiza la cantidad de stock de una variante
   * Solo owners, admins y managers pueden actualizar stock
   */
  @Patch('shops/:shopId/variants/:variantId/stock')
  async updateVariantStock(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() updateStockDto: UpdateStockDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    console.log('📦 Actualizando stock - Usuario:', currentUser.id, 'Variante:', variantId, 'Tienda:', shopId);
    
    // Verificar que la variante pertenece a la tienda especificada
    const variant = await this.prisma.productVariant.findFirst({
      where: { 
        id: variantId,
        product: {
          shopId: shopId
        }
      }
    });

    if (!variant) {
      return {
        success: false,
        message: 'Variante no encontrada en esta tienda'
      };
    }

    // Verificar permisos en la tienda
    const membership = await this.shopUserRepository.findMembershipWithRole(
      currentUser.id,
      shopId
    );

    if (!membership) {
      return {
        success: false,
        message: 'No tienes acceso a esta tienda'
      };
    }

    const allowedRoles = ['owner', 'admin', 'manager'];
    if (!allowedRoles.includes(membership.role.name.toLowerCase())) {
      return {
        success: false,
        message: `Necesitas ser owner, admin o manager. Tu rol actual: ${membership.role.name}`
      };
    }
    
    const input: UpdateStockInput = {
      variantId,
      quantity: updateStockDto.quantity,
      minStockAlert: updateStockDto.minStockAlert,
    };

    const inventory = await this.updateStock.execute(input);

    return {
      success: true,
      message: 'Stock actualizado exitosamente',
      data: {
        id: inventory.id,
        variantId: inventory.variantId,
        quantity: inventory.quantity,
        minStockAlert: inventory.minStockAlert,
        hasStock: inventory.hasStock(),
        isLowStock: inventory.isLowStock(),
        stockStatus: inventory.getStockStatus(),
        updatedAt: inventory.updatedAt,
      },
    };
  }

  /**
   * PATCH /api/shops/:shopId/variants/:variantId/stock/adjust
   * Ajusta el stock (incremento o decremento) de una variante
   * Solo owners y admins pueden hacer ajustes de stock
   */
  @Patch('shops/:shopId/variants/:variantId/stock/adjust')
  async adjustVariantStock(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() adjustStockDto: AdjustStockDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    console.log('🔧 Ajustando stock - Usuario:', currentUser.id, 'Variante:', variantId, 'Tienda:', shopId);
    
    // Verificar que la variante pertenece a la tienda especificada
    const variant = await this.prisma.productVariant.findFirst({
      where: { 
        id: variantId,
        product: {
          shopId: shopId
        }
      }
    });

    if (!variant) {
      return {
        success: false,
        message: 'Variante no encontrada en esta tienda'
      };
    }

    // Verificar permisos en la tienda
    const membership = await this.shopUserRepository.findMembershipWithRole(
      currentUser.id,
      shopId
    );

    if (!membership) {
      return {
        success: false,
        message: 'No tienes acceso a esta tienda'
      };
    }

    const allowedRoles = ['owner', 'admin'];
    if (!allowedRoles.includes(membership.role.name.toLowerCase())) {
      return {
        success: false,
        message: `Solo owners y admins pueden ajustar stock. Tu rol actual: ${membership.role.name}`
      };
    }
    
    const input: AdjustStockInput = {
      variantId,
      adjustment: adjustStockDto.adjustment,
      reason: adjustStockDto.reason,
    };

    const inventory = await this.adjustStock.execute(input);

    const action = adjustStockDto.adjustment > 0 ? 'incrementado' : 'decrementado';
    const amount = Math.abs(adjustStockDto.adjustment);

    return {
      success: true,
      message: `Stock ${action} en ${amount} unidades exitosamente`,
      data: {
        id: inventory.id,
        variantId: inventory.variantId,
        quantity: inventory.quantity,
        minStockAlert: inventory.minStockAlert,
        hasStock: inventory.hasStock(),
        isLowStock: inventory.isLowStock(),
        stockStatus: inventory.getStockStatus(),
        updatedAt: inventory.updatedAt,
        adjustment: {
          amount: adjustStockDto.adjustment,
          reason: adjustStockDto.reason,
        },
      },
    };
  }
}
