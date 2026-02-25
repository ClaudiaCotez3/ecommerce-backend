import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param,
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import type { CreateCategoryInput } from '../application/CreateCategory';
import { CreateCategory } from '../application/CreateCategory';
import type { AssignProductToCategoryInput } from '../application/AssignProductToCategory';
import { AssignProductToCategory } from '../application/AssignProductToCategory';
import type { GetCategoriesByShopInput } from '../application/GetCategoriesByShop';
import { GetCategoriesByShop } from '../application/GetCategoriesByShop';
import { AuthGuard } from '../../shops/infrastructure/AuthGuard';
import type { AuthenticatedRequest } from '../../shops/infrastructure/AuthGuard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ShopContext } from '../../../common/decorators/shop-context.decorator';
import { CurrentUser, type CurrentUserData } from '../../../common/decorators/current-user.decorator';

/**
 * DTO para validar datos de entrada - Crear Categoría
 */
export class CreateCategoryDto {
  name: string;
  description?: string;
}

/**
 * Controlador REST para operaciones de Category
 * NO contiene lógica de negocio, solo coordina requests
 */
@Controller()
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(
    private readonly createCategory: CreateCategory,
    private readonly assignProductToCategoryUseCase: AssignProductToCategory,
    private readonly getCategoriesByShop: GetCategoriesByShop,
  ) {}

  /**
   * POST /api/shops/:shopId/categories
   * Crea una nueva categoría para la tienda específica
   * Solo owners, admins y managers pueden crear categorías
   */
  @Post('shops/:shopId/categories')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ShopContext()
  @HttpCode(HttpStatus.CREATED)
  async createNewCategory(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    console.log('📂 Creando categoría - Usuario:', currentUser.id, 'Tienda:', shopId);
    
    const input: CreateCategoryInput = {
      shopId,
      name: createCategoryDto.name,
      description: createCategoryDto.description,
    };

    const category = await this.createCategory.execute(input);

    return {
      success: true,
      message: 'Categoría creada exitosamente',
      data: {
        id: category.id,
        shopId: category.shopId,
        name: category.name,
        description: category.description,
      },
    };
  }

  /**
   * GET /api/shops/:shopId/categories
   * Obtiene todas las categorías de una tienda
   */
  @Get('shops/:shopId/categories')
  async getShopCategories(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Request() request: AuthenticatedRequest,
  ) {
    const input: GetCategoriesByShopInput = { shopId };

    const categories = await this.getCategoriesByShop.execute(input);

    return {
      success: true,
      message: 'Categorías obtenidas exitosamente',
      data: categories.map(category => ({
        id: category.id,
        shopId: category.shopId,
        name: category.name,
        description: category.description,
      })),
      total: categories.length,
    };
  }

  /**
   * POST /api/shops/:shopId/categories/:categoryId/products/:productId
   * Asigna un producto a una categoría
   */
  @Post('shops/:shopId/categories/:categoryId/products/:productId')
  @HttpCode(HttpStatus.CREATED)
  async assignProductToCategory(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Request() request: AuthenticatedRequest,
  ) {
    // TODO: Validar que tanto la categoría como el producto pertenecen a la misma shop
    // TODO: Validar permisos del usuario sobre la shop
    
    const input: AssignProductToCategoryInput = {
      categoryId,
      productId,
    };

    await this.assignProductToCategoryUseCase.execute(input);

    return {
      success: true,
      message: 'Producto asignado a la categoría exitosamente',
      data: {
        categoryId,
        productId,
        shopId,
      },
    };
  }
}
