import { 
  Controller, 
  Get,
  Patch,
  Body, 
  Param,
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
  ) {}

  /**
   * GET /api/variants/:variantId/inventory
   * Obtiene el inventario de una variante específica
   */
  @Get('variants/:variantId/inventory')
  async getVariantInventory(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Request() request: AuthenticatedRequest,
  ) {
    // TODO: Validar permisos sobre la variante/shop
    
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
   * PATCH /api/variants/:variantId/stock
   * Actualiza la cantidad de stock de una variante
   */
  @Patch('variants/:variantId/stock')
  async updateVariantStock(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() updateStockDto: UpdateStockDto,
    @Request() request: AuthenticatedRequest,
  ) {
    // TODO: Validar permisos sobre la variante/shop
    
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
   * PATCH /api/variants/:variantId/stock/adjust
   * Ajusta el stock (incremento o decremento) de una variante
   */
  @Patch('variants/:variantId/stock/adjust')
  async adjustVariantStock(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() adjustStockDto: AdjustStockDto,
    @Request() request: AuthenticatedRequest,
  ) {
    // TODO: Validar permisos sobre la variante/shop
    
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
