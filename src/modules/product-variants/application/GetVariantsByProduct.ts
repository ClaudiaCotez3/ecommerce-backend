import { ProductVariant } from '../domain/ProductVariant';
import { ProductVariantRepository } from '../domain/ProductVariantRepository';

/**
 * Caso de uso: Obtener variantes por producto
 * Devuelve todas las variantes de un producto específico
 */
export class GetVariantsByProduct {
  constructor(private readonly variantRepository: ProductVariantRepository) {}

  async execute(input: GetVariantsByProductInput): Promise<ProductVariant[]> {
    // Validar entrada
    this.validateInput(input);

    // Obtener variantes del repositorio
    const variants = await this.variantRepository.listByProduct(input.productId);

    // Aplicar filtros
    let filteredVariants = variants;

    // Filtrar por estado si se especifica
    if (input.status) {
      filteredVariants = filteredVariants.filter(variant => {
        if (input.status === 'active') return variant.isActive();
        if (input.status === 'inactive') return !variant.isActive();
        return true; // 'all'
      });
    } else {
      // Por defecto, solo variantes activas
      filteredVariants = filteredVariants.filter(variant => variant.isActive());
    }

    // Ordenar por SKU alfabéticamente
    const sortedVariants = filteredVariants.sort((a, b) => {
      return a.sku.localeCompare(b.sku);
    });

    return sortedVariants;
  }

  private validateInput(input: GetVariantsByProductInput): void {
    if (!input.productId || input.productId <= 0) {
      throw new Error('El ID del producto es requerido y debe ser válido');
    }

    // Validar status si se proporciona
    if (input.status !== undefined) {
      const validStatuses = ['active', 'inactive', 'all'];
      if (!validStatuses.includes(input.status)) {
        throw new Error(`Estado inválido. Estados válidos: ${validStatuses.join(', ')}`);
      }
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface GetVariantsByProductInput {
  productId: number;
  status?: 'active' | 'inactive' | 'all';
}
