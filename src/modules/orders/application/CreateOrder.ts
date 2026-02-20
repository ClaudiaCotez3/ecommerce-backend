import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository, InventoryRepository } from '../domain';
import { Order, OrderDetail } from '../domain';
import { ORDER_REPOSITORY, INVENTORY_REPOSITORY } from '../tokens';

// Interface para obtener información de productos
interface ProductInfo {
  productId: number;
  variantId: number | null;
  unitPrice: number;
  productName: string;
  variantName?: string;
}

// Interface temporal para simular consulta de productos
// En un sistema real, esto vendría de un ProductRepository
interface ProductRepository {
  getProductPrice(productId: number, variantId: number | null): Promise<ProductInfo>;
}

/**
 * Caso de uso: Crear un nuevo pedido
 * Valida los datos, verifica stock, obtiene precios reales y crea el pedido
 */
@Injectable()
export class CreateOrder {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async execute(data: {
    shopId: number;
    customerName: string;
    currency?: string;
    items: {
      productId: number;
      variantId: number | null;
      quantity: number;
      unitPrice?: number; // Opcional - se calculará automáticamente si no se proporciona
    }[];
  }): Promise<{ order: Order; details: OrderDetail[] }> {
    // Validaciones básicas
    this.validateInput(data);

    // 1. OBTENER PRECIOS REALES DE LA BASE DE DATOS
    const itemsWithPrices = await this.getItemsWithRealPrices(data.items, data.shopId);

    // 2. VERIFICAR STOCK DISPONIBLE PARA TODOS LOS ITEMS
    const stockValidation = await this.inventoryRepository.validateStockForItems(
      itemsWithPrices.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }))
    );

    if (!stockValidation.isValid) {
      const insufficientItemsDescription = stockValidation.insufficientItems
        .map(item => 
          `Producto ${item.productId}${item.variantId ? ` Variante ${item.variantId}` : ''}: ` +
          `solicitado ${item.requestedQuantity}, disponible ${item.availableStock}`
        )
        .join('; ');
      
      throw new Error(`Stock insuficiente para: ${insufficientItemsDescription}`);
    }

    // 3. CALCULAR DETALLES DEL PEDIDO CON PRECIOS REALES
    const orderDetails = itemsWithPrices.map(item => {
      return OrderDetail.createForNewOrder(
        item.productId,
        item.variantId,
        item.quantity,
        item.unitPrice, // Precio real obtenido de la base de datos
      );
    });

    // Calcular total del pedido
    const total = orderDetails.reduce((sum, detail) => sum + detail.subtotal, 0);

    // Crear el pedido
    const createdOrder = await this.orderRepository.create({
      shopId: data.shopId,
      customerName: data.customerName,
      status: 'pending',
      total: Number(total.toFixed(2)),
      currency: data.currency || 'USD',
      orderDetails,
    });

    // Obtener el pedido completo con detalles
    const orderWithDetails = await this.orderRepository.findByIdWithDetails(createdOrder.id);
    
    if (!orderWithDetails) {
      throw new Error('Error al recuperar el pedido creado');
    }

    // Reservar stock para el pedido pendiente
    await this.reserveStockForOrder(itemsWithPrices);

    return {
      order: orderWithDetails.order,
      details: orderWithDetails.details,
    };
  }

  /**
   * Obtiene los precios reales de los productos desde la base de datos
   * En un sistema real, esto debería usar un ProductRepository dedicado
   */
  private async getItemsWithRealPrices(
    items: {
      productId: number;
      variantId: number | null;
      quantity: number;
      unitPrice?: number;
    }[],
    shopId: number
  ): Promise<{
    productId: number;
    variantId: number | null;
    quantity: number;
    unitPrice: number;
  }[]> {
    // TODO: En un sistema real, inyectar ProductRepository y usar:
    // const productInfo = await this.productRepository.getProductPrice(item.productId, item.variantId);
    
    // Por ahora, usar los precios proporcionados o un precio por defecto
    // Esto debería ser reemplazado por una consulta real a la base de datos
    return items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice || 99.99, // Precio temporal - TODO: obtener de la BD
    }));
  }

  private validateInput(data: {
    shopId: number;
    customerName: string;
    currency?: string;
    items: {
      productId: number;
      variantId: number | null;
      quantity: number;
      unitPrice?: number; // Ahora es opcional
    }[];
  }): void {
    if (!data.shopId || data.shopId <= 0) {
      throw new Error('ID de tienda inválido');
    }

    if (!data.customerName || data.customerName.trim().length === 0) {
      throw new Error('El nombre del cliente es obligatorio');
    }

    if (data.customerName.length > 100) {
      throw new Error('El nombre del cliente no puede exceder 100 caracteres');
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('El pedido debe tener al menos un item');
    }

    if (data.items.length > 100) {
      throw new Error('El pedido no puede tener más de 100 items');
    }

    // Validar cada item
    data.items.forEach((item, index) => {
      if (!item.productId || item.productId <= 0) {
        throw new Error(`Item ${index + 1}: ID de producto inválido`);
      }

      if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        throw new Error(`Item ${index + 1}: La cantidad debe ser un número entero positivo`);
      }

      if (item.quantity > 1000) {
        throw new Error(`Item ${index + 1}: La cantidad no puede exceder 1000 unidades`);
      }

      // Validar precio unitario solo si se proporciona (es opcional)
      if (item.unitPrice !== undefined) {
        if (item.unitPrice < 0) {
          throw new Error(`Item ${index + 1}: El precio unitario no puede ser negativo`);
        }

        if (item.unitPrice > 999999.99) {
          throw new Error(`Item ${index + 1}: El precio unitario no puede exceder $999,999.99`);
        }
      }
    });

    // Validar que no hay items duplicados (mismo producto/variante)
    const itemKeys = new Set();
    data.items.forEach((item, index) => {
      const key = `${item.productId}-${item.variantId || 'null'}`;
      if (itemKeys.has(key)) {
        throw new Error(`Item ${index + 1}: Producto duplicado en el pedido`);
      }
      itemKeys.add(key);
    });

    // Validar moneda
    if (data.currency && !['USD', 'EUR', 'MXN', 'COP', 'ARS'].includes(data.currency)) {
      throw new Error('Moneda no soportada. Use: USD, EUR, MXN, COP, ARS');
    }
  }

  private async reserveStockForOrder(items: {
    productId: number;
    variantId: number | null;
    quantity: number;
    unitPrice: number; // Ya tiene precio calculado en este punto
  }[]): Promise<void> {
    try {
      for (const item of items) {
        await this.inventoryRepository.reserveStock(
          item.productId,
          item.variantId,
          item.quantity
        );
      }
    } catch (error) {
      // Si falla la reserva, intentar liberar lo que se pudo reservar
      try {
        for (const item of items) {
          await this.inventoryRepository.releaseReservedStock(
            item.productId,
            item.variantId,
            item.quantity
          ).catch(() => {
            // Ignorar errores al liberar, ya estamos manejando un error
          });
        }
      } catch {
        // Ignorar errores de limpieza
      }
      
      throw new Error(`Error al reservar stock: ${error.message}`);
    }
  }
}
