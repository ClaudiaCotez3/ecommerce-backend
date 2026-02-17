import { 
  Controller, 
  Post, 
  Get, 
  Patch,
  Body, 
  Param,
  Query,
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import type { CreateProductInput } from '../application/CreateProduct';
import { CreateProduct } from '../application/CreateProduct';
import type { UpdateProductInput } from '../application/UpdateProduct';
import { UpdateProduct } from '../application/UpdateProduct';
import type { GetProductsByShopInput } from '../application/GetProductsByShop';
import { GetProductsByShop } from '../application/GetProductsByShop';
import type { ChangeProductStatusInput } from '../application/ChangeProductStatus';
import { ChangeProductStatus } from '../application/ChangeProductStatus';
import { AuthGuard } from '../../shops/infrastructure/AuthGuard';
import type { AuthenticatedRequest } from '../../shops/infrastructure/AuthGuard';

/**
 * DTO para validar datos de entrada - Crear Producto
 */
export class CreateProductDto {
  name: string;
  description?: string;
  basePrice: number;
}

/**
 * DTO para validar datos de entrada - Actualizar Producto
 */
export class UpdateProductDto {
  name?: string;
  description?: string;
  basePrice?: number;
  status?: string;
}

/**
 * DTO para cambiar estado del producto
 */
export class ChangeStatusDto {
  status: 'active' | 'inactive';
}

/**
 * Controlador REST para operaciones de Product
 * NO contiene lógica de negocio, solo coordina requests
 */
@Controller()
@UseGuards(AuthGuard)
export class ProductController {
  constructor(
    private readonly createProduct: CreateProduct,
    private readonly updateProduct: UpdateProduct,
    private readonly getProductsByShop: GetProductsByShop,
    private readonly changeProductStatus: ChangeProductStatus,
  ) {}

  /**
   * POST /api/shops/:shopId/products
   * Crea un nuevo producto para la tienda específica
   */
  @Post('shops/:shopId/products')
  @HttpCode(HttpStatus.CREATED)
  async createNewProduct(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body() createProductDto: CreateProductDto,
    @Request() request: AuthenticatedRequest,
  ) {
    // TODO: Aquí deberías validar que el usuario tenga permisos sobre la shop
    // Por simplicidad, asumimos que está autenticado
    
    const input: CreateProductInput = {
      shopId,
      name: createProductDto.name,
      description: createProductDto.description,
      basePrice: createProductDto.basePrice,
    };

    const product = await this.createProduct.execute(input);

    return {
      success: true,
      message: 'Producto creado exitosamente',
      data: {
        id: product.id,
        shopId: product.shopId,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        status: product.status,
        createdAt: product.createdAt,
      },
    };
  }

  /**
   * PATCH /api/shops/:shopId/products/:productId
   * Actualiza un producto específico de la tienda
   */
  @Patch('shops/:shopId/products/:productId')
  async updateExistingProduct(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() request: AuthenticatedRequest,
  ) {
    const input: UpdateProductInput = {
      productId,
      shopId,
      name: updateProductDto.name,
      description: updateProductDto.description,
      basePrice: updateProductDto.basePrice,
      status: updateProductDto.status,
    };

    const product = await this.updateProduct.execute(input);

    return {
      success: true,
      message: 'Producto actualizado exitosamente',
      data: {
        id: product.id,
        shopId: product.shopId,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        status: product.status,
        createdAt: product.createdAt,
      },
    };
  }

  /**
   * GET /api/shops/:shopId/products
   * Obtiene todos los productos de una tienda
   */
  @Get('shops/:shopId/products')
  async getShopProducts(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Request() request: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('search') searchTerm?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const offset = offsetStr ? parseInt(offsetStr, 10) : undefined;

    const input: GetProductsByShopInput = {
      shopId,
      status,
      searchTerm,
      limit,
      offset,
    };

    const products = await this.getProductsByShop.execute(input);

    return {
      success: true,
      message: 'Productos obtenidos exitosamente',
      data: products.map(product => ({
        id: product.id,
        shopId: product.shopId,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        status: product.status,
        isActive: product.isActive(),
        createdAt: product.createdAt,
      })),
      total: products.length,
    };
  }

  /**
   * PATCH /api/shops/:shopId/products/:productId/status
   * Cambia el estado de un producto (activar/desactivar)
   */
  @Patch('shops/:shopId/products/:productId/status')
  async changeStatus(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() changeStatusDto: ChangeStatusDto,
    @Request() request: AuthenticatedRequest,
  ) {
    const input: ChangeProductStatusInput = {
      productId,
      shopId,
      status: changeStatusDto.status,
    };

    const product = await this.changeProductStatus.execute(input);

    return {
      success: true,
      message: `Producto ${changeStatusDto.status === 'active' ? 'activado' : 'desactivado'} exitosamente`,
      data: {
        id: product.id,
        shopId: product.shopId,
        name: product.name,
        status: product.status,
        isActive: product.isActive(),
      },
    };
  }
}
