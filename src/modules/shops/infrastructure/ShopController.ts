import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { CreateShopInput } from '../application/CreateShop';
import { CreateShop } from '../application/CreateShop';
import { GetShopsByOwner } from '../application/GetShopsByOwner';
import { AuthGuard } from './AuthGuard';
import type { AuthenticatedRequest } from './AuthGuard';

/**
 * DTO para validar datos de entrada
 */
export class CreateShopDto {
  name: string;
  description?: string;
  currency: string;
}

/**
 * Controlador REST para operaciones de Shop
 * NO contiene lógica de negocio, solo coordina requests
 */
@Controller('shops')
@UseGuards(AuthGuard)
export class ShopController {
  constructor(
    private readonly createShop: CreateShop,
    private readonly getShopsByOwner: GetShopsByOwner,
  ) {}

  /**
   * POST /api/shops
   * Crea una nueva shop para el usuario autenticado
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNewShop(
    @Body() createShopDto: CreateShopDto,
    @Request() request: AuthenticatedRequest,
  ) {
    const input: CreateShopInput = {
      name: createShopDto.name,
      description: createShopDto.description,
      currency: createShopDto.currency,
      ownerId: request.user.id, // Del usuario autenticado
    };

    const shop = await this.createShop.execute(input);

    return {
      success: true,
      message: 'Tienda creada exitosamente',
      data: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        currency: shop.currency,
        status: shop.status,
        ownerId: shop.ownerId,
        createdAt: shop.createdAt,
      },
    };
  }

  /**
   * GET /api/shops/my-shops
   * Obtiene todas las shops del usuario autenticado
   */
  @Get('my-shops')
  async getMyShops(@Request() request: AuthenticatedRequest) {
    const shops = await this.getShopsByOwner.execute({
      ownerId: request.user.id,
    });

    return {
      success: true,
      message: 'Tiendas obtenidas exitosamente',
      data: shops.map(shop => ({
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        currency: shop.currency,
        status: shop.status,
        createdAt: shop.createdAt,
      })),
      total: shops.length,
    };
  }
}
