import { Product } from '../domain/Product';
import { ProductRepository } from '../domain/ProductRepository';

/**
 * Caso de uso: Cambiar el estado de un producto
 * Permite activar/desactivar productos sin eliminarlos
 */
export class ChangeProductStatus {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: ChangeProductStatusInput): Promise<Product> {
    // Validar datos de entrada
    this.validateInput(input);

    // Verificar que el producto existe y pertenece a la tienda
    const existingProduct = await this.productRepository.findById(input.productId);
    
    if (!existingProduct) {
      throw new Error('El producto no existe');
    }

    if (!existingProduct.belongsToShop(input.shopId)) {
      throw new Error('El producto no pertenece a esta tienda');
    }

    // Verificar que el estado realmente cambia
    if (existingProduct.status === input.status) {
      throw new Error(`El producto ya tiene el estado '${input.status}'`);
    }

    // Cambiar estado usando el repositorio
    const updatedProduct = await this.productRepository.changeStatus(input.productId, input.status);

    return updatedProduct;
  }

  private validateInput(input: ChangeProductStatusInput): void {
    if (!input.productId || input.productId <= 0) {
      throw new Error('El ID del producto es requerido y debe ser válido');
    }

    if (!input.shopId || input.shopId <= 0) {
      throw new Error('El ID de la tienda es requerido y debe ser válido');
    }

    if (!input.status || input.status.trim().length === 0) {
      throw new Error('El estado es requerido');
    }

    // Validar estados válidos
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(input.status)) {
      throw new Error(`Estado inválido. Estados válidos: ${validStatuses.join(', ')}`);
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface ChangeProductStatusInput {
  productId: number;
  shopId: number;
  status: 'active' | 'inactive';
}
