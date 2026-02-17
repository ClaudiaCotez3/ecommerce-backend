import { Product } from '../domain/Product';
import { ProductRepository } from '../domain/ProductRepository';

/**
 * Caso de uso: Actualizar un producto existente
 * Encapsula la lógica de negocio para la actualización de productos
 */
export class UpdateProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: UpdateProductInput): Promise<Product> {
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

    // Preparar datos de actualización usando la lógica de dominio
    const updateData = existingProduct.updateFields({
      name: input.name,
      description: input.description,
      basePrice: input.basePrice,
      status: input.status,
    });

    // Actualizar en el repositorio
    const updatedProduct = await this.productRepository.update(input.productId, updateData);

    return updatedProduct;
  }

  private validateInput(input: UpdateProductInput): void {
    if (!input.productId || input.productId <= 0) {
      throw new Error('El ID del producto es requerido y debe ser válido');
    }

    if (!input.shopId || input.shopId <= 0) {
      throw new Error('El ID de la tienda es requerido y debe ser válido');
    }

    // Al menos un campo debe estar presente para actualizar
    const hasFieldsToUpdate = 
      input.name !== undefined || 
      input.description !== undefined || 
      input.basePrice !== undefined || 
      input.status !== undefined;

    if (!hasFieldsToUpdate) {
      throw new Error('Debe proporcionar al menos un campo para actualizar');
    }

    // Validar precio si se proporciona
    if (input.basePrice !== undefined) {
      if (input.basePrice <= 0) {
        throw new Error('El precio base debe ser mayor a 0');
      }
      if (isNaN(Number(input.basePrice))) {
        throw new Error('El precio base debe ser un número válido');
      }
    }

    // Validar nombre si se proporciona
    if (input.name !== undefined && (!input.name || input.name.trim().length === 0)) {
      throw new Error('El nombre del producto no puede estar vacío');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface UpdateProductInput {
  productId: number;
  shopId: number;
  name?: string;
  description?: string;
  basePrice?: number;
  status?: string;
}
