import { ProductVariant } from './ProductVariant';

/**
 * Interface del repositorio de ProductVariant
 * Define los contratos que debe cumplir cualquier implementación
 * NO depende de tecnologías específicas (Prisma, MongoDB, etc.)
 */
export interface ProductVariantRepository {
  /**
   * Crea una nueva variante de producto
   */
  create(variantData: {
    productId: number;
    sku: string;
    specialPrice: number | null;
    attributes: Record<string, any>;
    status: string;
  }): Promise<ProductVariant>;

  /**
   * Busca una variante por su ID
   */
  findById(id: number): Promise<ProductVariant | null>;

  /**
   * Busca una variante por su SKU
   */
  findBySku(sku: string): Promise<ProductVariant | null>;

  /**
   * Lista todas las variantes de un producto
   */
  listByProduct(productId: number): Promise<ProductVariant[]>;

  /**
   * Actualiza una variante existente
   */
  update(
    variantId: number,
    updateData: {
      sku?: string;
      specialPrice?: number | null;
      attributes?: Record<string, any>;
      status?: string;
    }
  ): Promise<ProductVariant>;

  /**
   * Verifica si un SKU ya existe
   */
  existsBySku(sku: string, excludeId?: number): Promise<boolean>;

  /**
   * Verifica si una variante pertenece a un producto específico
   */
  belongsToProduct(variantId: number, productId: number): Promise<boolean>;
}
