import { Product } from '../domain/Product';
import { ProductRepository } from '../domain/ProductRepository';

/**
 * Caso de uso: Obtener productos por tienda
 * Devuelve todos los productos de una tienda con filtros opcionales
 */
export class GetProductsByShop {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: GetProductsByShopInput): Promise<Product[]> {
    // Validar entrada
    this.validateInput(input);

    // Preparar filtros
    const filters = {
      status: input.status || 'active', // Por defecto solo productos activos
      searchTerm: input.searchTerm,
      limit: input.limit || 50, // Límite por defecto
      offset: input.offset || 0,
    };

    // Obtener productos del repositorio
    const products = await this.productRepository.listByShop(input.shopId, filters);

    // Aplicar ordenamiento adicional si es necesario
    const sortedProducts = products.sort((a, b) => {
      // Ordenar por fecha de creación (más recientes primero)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return sortedProducts;
  }

  private validateInput(input: GetProductsByShopInput): void {
    if (!input.shopId || input.shopId <= 0) {
      throw new Error('El ID de la tienda es requerido y debe ser válido');
    }

    // Validar límite si se proporciona
    if (input.limit !== undefined) {
      if (input.limit <= 0 || input.limit > 100) {
        throw new Error('El límite debe estar entre 1 y 100');
      }
    }

    // Validar offset si se proporciona
    if (input.offset !== undefined && input.offset < 0) {
      throw new Error('El offset no puede ser negativo');
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
export interface GetProductsByShopInput {
  shopId: number;
  status?: string; // 'active', 'inactive', 'all'
  searchTerm?: string;
  limit?: number;
  offset?: number;
}
