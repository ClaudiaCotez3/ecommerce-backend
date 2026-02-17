import { Product } from '../domain/Product';
import { ProductRepository } from '../domain/ProductRepository';

/**
 * Caso de uso: Crear un nuevo producto
 * Encapsula la lógica de negocio para la creación de productos
 */
export class CreateProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    // Validar datos de entrada
    this.validateInput(input);

    // Crear la entidad de dominio
    const productData = Product.create(
      input.shopId,
      input.name,
      input.description || null,
      input.basePrice,
    );

    // Guardar en el repositorio
    const createdProduct = await this.productRepository.create(productData);

    return createdProduct;
  }

  private validateInput(input: CreateProductInput): void {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('El nombre del producto es requerido');
    }

    if (!input.basePrice || input.basePrice <= 0) {
      throw new Error('El precio base debe ser mayor a 0');
    }

    if (!input.shopId || input.shopId <= 0) {
      throw new Error('El ID de la tienda es requerido y debe ser válido');
    }

    // Validar que el precio sea un número válido
    if (isNaN(Number(input.basePrice))) {
      throw new Error('El precio base debe ser un número válido');
    }

    // Validar longitud del nombre
    if (input.name.length > 150) {
      throw new Error('El nombre del producto no puede exceder 150 caracteres');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface CreateProductInput {
  shopId: number;
  name: string;
  description?: string;
  basePrice: number;
}
