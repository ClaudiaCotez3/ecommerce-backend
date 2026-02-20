import { ProductVariant } from '../domain/ProductVariant';
import { ProductVariantRepository } from '../domain/ProductVariantRepository';

/**
 * Caso de uso: Crear una nueva variante de producto
 * Encapsula la lógica de negocio para la creación de variantes
 */
export class CreateVariant {
  constructor(private readonly variantRepository: ProductVariantRepository) {}

  async execute(input: CreateVariantInput): Promise<ProductVariant> {
    // Validar datos de entrada
    this.validateInput(input);

    // Verificar que el SKU sea único
    const existingVariant = await this.variantRepository.findBySku(input.sku.toUpperCase());
    if (existingVariant) {
      throw new Error(`Ya existe una variante con el SKU: ${input.sku}`);
    }

    // Crear la entidad de dominio
    const variantData = ProductVariant.create(
      input.productId,
      input.sku,
      input.specialPrice || null,
      input.attributes || {},
    );

    // Guardar en el repositorio
    const createdVariant = await this.variantRepository.create(variantData);

    return createdVariant;
  }

  private validateInput(input: CreateVariantInput): void {
    if (!input.productId || input.productId <= 0) {
      throw new Error('El ID del producto es requerido y debe ser válido');
    }

    if (!input.sku || input.sku.trim().length === 0) {
      throw new Error('El SKU es requerido');
    }

    if (input.sku.length > 100) {
      throw new Error('El SKU no puede exceder 100 caracteres');
    }

    // Validar precio especial si se proporciona
    if (input.specialPrice !== undefined && input.specialPrice !== null) {
      if (input.specialPrice <= 0) {
        throw new Error('El precio especial debe ser mayor a 0');
      }
      if (isNaN(Number(input.specialPrice))) {
        throw new Error('El precio especial debe ser un número válido');
      }
    }

    // Validar formato del SKU (solo letras, números, guiones)
    const skuPattern = /^[A-Z0-9\-_]+$/i;
    if (!skuPattern.test(input.sku.trim())) {
      throw new Error('El SKU solo puede contener letras, números, guiones y guiones bajos');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface CreateVariantInput {
  productId: number;
  sku: string;
  specialPrice?: number;
  attributes?: Record<string, any>;
}
