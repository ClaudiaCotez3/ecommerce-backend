import { Category } from '../domain/Category';
import { CategoryRepository } from '../domain/CategoryRepository';

/**
 * Caso de uso: Obtener categorías por tienda
 * Devuelve todas las categorías de una tienda específica
 */
export class GetCategoriesByShop {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: GetCategoriesByShopInput): Promise<Category[]> {
    // Validar entrada
    this.validateInput(input);

    // Obtener categorías del repositorio
    const categories = await this.categoryRepository.listByShop(input.shopId);

    // Aplicar ordenamiento (por nombre alfabéticamente)
    const sortedCategories = categories.sort((a, b) => {
      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });

    return sortedCategories;
  }

  private validateInput(input: GetCategoriesByShopInput): void {
    if (!input.shopId || input.shopId <= 0) {
      throw new Error('El ID de la tienda es requerido y debe ser válido');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface GetCategoriesByShopInput {
  shopId: number;
}
