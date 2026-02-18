import { Category } from './Category';

/**
 * Interface del repositorio de Category
 * Define los contratos que debe cumplir cualquier implementación
 * NO depende de tecnologías específicas (Prisma, MongoDB, etc.)
 */
export interface CategoryRepository {
  /**
   * Crea una nueva categoría en el sistema
   */
  create(categoryData: {
    shopId: number;
    name: string;
    description: string | null;
  }): Promise<Category>;

  /**
   * Busca una categoría por su ID
   */
  findById(categoryId: number): Promise<Category | null>;

  /**
   * Lista todas las categorías de una tienda
   */
  listByShop(shopId: number): Promise<Category[]>;

  /**
   * Asigna un producto a una categoría (relación ProductCategory)
   */
  assignProduct(categoryId: number, productId: number): Promise<void>;

  /**
   * Verifica si ya existe una categoría con ese nombre en la tienda
   */
  existsByName(shopId: number, name: string): Promise<boolean>;

  /**
   * Verifica si un producto ya está asignado a una categoría
   */
  isProductAssigned(categoryId: number, productId: number): Promise<boolean>;

  /**
   * Obtiene todas las categorías de un producto específico
   */
  getCategoriesByProduct(productId: number): Promise<Category[]>;
}
