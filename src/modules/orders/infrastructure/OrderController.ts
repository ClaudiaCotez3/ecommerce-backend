import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../shops/infrastructure/AuthGuard';
import { AuthGuard } from '../../shops/infrastructure/AuthGuard';
import {
  CreateOrder,
  AddItemToOrder,
  ConfirmOrder,
  GetOrdersByShop,
  GetOrderById,
  CancelOrder,
} from '../application';

/**
 * Controlador REST para operaciones de pedidos
 * Maneja las peticiones HTTP y delega la lógica de negocio a los casos de uso
 */
@Controller('shops/:shopId/orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrder,
    private readonly addItemToOrderUseCase: AddItemToOrder,
    private readonly confirmOrderUseCase: ConfirmOrder,
    private readonly getOrdersByShopUseCase: GetOrdersByShop,
    private readonly getOrderByIdUseCase: GetOrderById,
    private readonly cancelOrderUseCase: CancelOrder,
  ) {}

  /**
   * POST /shops/:shopId/orders
   * Crear un nuevo pedido
   */
  @Post()
  async createOrder(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body()
    createOrderDto: {
      customerName: string;
      currency?: string;
      orderItems: {  // ← Cambiado de 'items' a 'orderItems' para coincidir con tu JSON
        productId: number;
        variantId?: number | null;
        quantity: number;
        unitPrice?: number;  // ← Opcional, se calculará automáticamente
      }[];
    },
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      // Validaciones básicas antes de procesar
      if (!createOrderDto.orderItems || createOrderDto.orderItems.length === 0) {
        return {
          success: false,
          message: 'El pedido debe contener al menos un producto',
          error: 'VALIDATION_ERROR',
        };
      }

      if (!createOrderDto.customerName?.trim()) {
        return {
          success: false,
          message: 'El nombre del cliente es requerido',
          error: 'VALIDATION_ERROR',
        };
      }

      const result = await this.createOrderUseCase.execute({
        shopId: shopId,
        customerName: createOrderDto.customerName.trim(),
        currency: createOrderDto.currency || 'USD',
        items: createOrderDto.orderItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0, // Se calculará automáticamente en el caso de uso
        })),
      });

      return {
        success: true,
        message: 'Pedido creado exitosamente',
        data: {
          order: {
            id: result.order.id,
            shopId: result.order.shopId,
            customerName: result.order.customerName,
            status: result.order.status,
            total: result.order.total,
            currency: result.order.currency,
            createdAt: result.order.createdAt,
          },
          details: result.details.map(detail => ({
            id: detail.id,
            productId: detail.productId,
            variantId: detail.variantId,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            subtotal: detail.subtotal,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: 'CREATE_ORDER_ERROR',
      };
    }
  }

  /**
   * GET /shops/:shopId/orders
   * Obtener todos los pedidos de una tienda
   */
  @Get()
  async getOrdersByShop(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const orders = await this.getOrdersByShopUseCase.execute(shopId);

      return {
        success: true,
        data: orders.map(order => ({
          id: order.id,
          shopId: order.shopId,
          customerName: order.customerName,
          status: order.status,
          total: order.total,
          currency: order.currency,
          createdAt: order.createdAt,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: 'GET_ORDERS_BY_SHOP_ERROR',
      };
    }
  }

  /**
   * GET /shops/:shopId/orders/:id
   * Obtener un pedido específico por ID
   */
  @Get(':id')
  async getOrderById(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const result = await this.getOrderByIdUseCase.execute(id);

      return {
        success: true,
        data: {
          order: {
            id: result.order.id,
            shopId: result.order.shopId,
            customerName: result.order.customerName,
            status: result.order.status,
            total: result.order.total,
            currency: result.order.currency,
            createdAt: result.order.createdAt,
          },
          details: result.details.map(detail => ({
            id: detail.id,
            productId: detail.productId,
            variantId: detail.variantId,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            subtotal: detail.subtotal,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: 'GET_ORDER_BY_ID_ERROR',
      };
    }
  }

  /**
   * POST /shops/:shopId/orders/:id/items
   * Agregar un item a un pedido
   */
  @Post(':id/items')
  async addItemToOrder(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('id', ParseIntPipe) orderId: number,
    @Body()
    addItemDto: {
      productId: number;
      variantId?: number | null;
      quantity: number;
      unitPrice: number;
    },
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const result = await this.addItemToOrderUseCase.execute({
        orderId,
        productId: addItemDto.productId,
        variantId: addItemDto.variantId || null,
        quantity: addItemDto.quantity,
        unitPrice: addItemDto.unitPrice,
      });

      return {
        success: true,
        message: 'Item agregado al pedido exitosamente',
        data: {
          id: result.id,
          productId: result.productId,
          variantId: result.variantId,
          quantity: result.quantity,
          unitPrice: result.unitPrice,
          subtotal: result.subtotal,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: 'ADD_ITEM_TO_ORDER_ERROR',
      };
    }
  }

  /**
   * PATCH /shops/:shopId/orders/:id/confirm
   * Confirmar un pedido
   */
  @Patch(':id/confirm')
  async confirmOrder(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('id', ParseIntPipe) orderId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const result = await this.confirmOrderUseCase.execute(orderId);

      return {
        success: true,
        message: 'Pedido confirmado exitosamente',
        data: {
          id: result.id,
          shopId: result.shopId,
          customerName: result.customerName,
          status: result.status,
          total: result.total,
          currency: result.currency,
          createdAt: result.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: 'CONFIRM_ORDER_ERROR',
      };
    }
  }

  /**
   * PATCH /shops/:shopId/orders/:id/cancel
   * Cancelar un pedido
   */
  @Patch(':id/cancel')
  async cancelOrder(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('id', ParseIntPipe) orderId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const result = await this.cancelOrderUseCase.execute(orderId);

      return {
        success: true,
        message: 'Pedido cancelado exitosamente',
        data: {
          id: result.id,
          shopId: result.shopId,
          customerName: result.customerName,
          status: result.status,
          total: result.total,
          currency: result.currency,
          createdAt: result.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: 'CANCEL_ORDER_ERROR',
      };
    }
  }
}
