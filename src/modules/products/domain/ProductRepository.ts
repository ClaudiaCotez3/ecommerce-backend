import { Product } from './Product';

/**
 * Interface del repositorio de Product
 * Define los contratos que debe cumplir cualquier implementación
 * NO depende de tecnologías específicas (Prisma, MongoDB, etc.)
 */
export interface ProductRepository {
  /**
   * Crea un nuevo producto en el sistema
   */
  create(productData: {
    shopId: number;
    name: string;
    description: string | null;
    basePrice: number;
    status: string;
  }): Promise<Product>;

  /**
   * Actualiza un producto existente
   */
  update(
    productId: number, 
    updateData: {
      name?: string;
      description?: string | null;
      basePrice?: number;
      status?: string;
    }
  ): Promise<Product>;

  /**
   * Busca un producto por su ID
   */
  findById(productId: number): Promise<Product | null>;

  /**
   * Lista todos los productos de una tienda
   */
  listByShop(
    shopId: number, 
    filters?: {
      status?: string;
      searchTerm?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Product[]>;

  /**
   * Cambia el estado de un producto
   */
  changeStatus(productId: number, status: string): Promise<Product>;

  /**
   * Verifica si un producto pertenece a una tienda específica
   */
  belongsToShop(productId: number, shopId: number): Promise<boolean>;
}
