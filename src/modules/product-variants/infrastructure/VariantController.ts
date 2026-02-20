import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param,
  Query,
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import type { CreateVariantInput } from '../application/CreateVariant';
import { CreateVariant } from '../application/CreateVariant';
import type { GetVariantsByProductInput } from '../application/GetVariantsByProduct';
import { GetVariantsByProduct } from '../application/GetVariantsByProduct';
import { AuthGuard } from '../../shops/infrastructure/AuthGuard';
import type { AuthenticatedRequest } from '../../shops/infrastructure/AuthGuard';

/**
 * DTO para validar datos de entrada - Crear Variante
 */
export class CreateVariantDto {
  sku: string;
  specialPrice?: number;
  attributes?: Record<string, any>;
}

/**
 * Controlador REST para operaciones de ProductVariant
 * NO contiene lógica de negocio, solo coordina requests
 */
@Controller()
@UseGuards(AuthGuard)
export class VariantController {
  constructor(
    private readonly createVariant: CreateVariant,
    private readonly getVariantsByProduct: GetVariantsByProduct,
  ) {}

  /**
   * POST /api/shops/:shopId/products/:productId/variants
   * Crea una nueva variante para un producto específico
   */
  @Post('shops/:shopId/products/:productId/variants')
  @HttpCode(HttpStatus.CREATED)
  async createNewVariant(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createVariantDto: CreateVariantDto,
    @Request() request: AuthenticatedRequest,
  ) {
    // TODO: Validar que el usuario tenga permisos sobre la shop
    // TODO: Validar que el producto pertenece a la shop
    
    const input: CreateVariantInput = {
      productId,
      sku: createVariantDto.sku,
      specialPrice: createVariantDto.specialPrice,
      attributes: createVariantDto.attributes || {},
    };

    const variant = await this.createVariant.execute(input);

    return {
      success: true,
      message: 'Variante creada exitosamente',
      data: {
        id: variant.id,
        productId: variant.productId,
        sku: variant.sku,
        specialPrice: variant.specialPrice,
        attributes: variant.attributes,
        status: variant.status,
        isActive: variant.isActive(),
      },
    };
  }

  /**
   * GET /api/shops/:shopId/products/:productId/variants
   * Obtiene todas las variantes de un producto
   */
  @Get('shops/:shopId/products/:productId/variants')
  async getProductVariants(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Request() request: AuthenticatedRequest,
    @Query('status') status?: string,
  ) {
    // TODO: Validar permisos sobre la shop
    // TODO: Validar que el producto pertenece a la shop

    const input: GetVariantsByProductInput = {
      productId,
      status: status as 'active' | 'inactive' | 'all',
    };

    const variants = await this.getVariantsByProduct.execute(input);

    return {
      success: true,
      message: 'Variantes obtenidas exitosamente',
      data: variants.map(variant => ({
        id: variant.id,
        productId: variant.productId,
        sku: variant.sku,
        specialPrice: variant.specialPrice,
        effectivePrice: variant.getEffectivePrice(),
        attributes: variant.attributes,
        status: variant.status,
        isActive: variant.isActive(),
      })),
      total: variants.length,
    };
  }
}
