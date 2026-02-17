import { Shop } from './Shop';

/**
 * Interface del repositorio de Shop
 * Define los contratos que debe cumplir cualquier implementación
 * NO depende de tecnologías específicas (Prisma, MongoDB, etc.)
 */
export interface ShopRepository {
  /**
   * Crea una nueva shop en el sistema
   */
  create(shopData: {
    name: string;
    slug: string;
    description: string | null;
    currency: string;
    status: string;
    ownerId: string;
  }): Promise<Shop>;

  /**
   * Busca una shop por su ID
   */
  findById(id: number): Promise<Shop | null>;

  /**
   * Busca todas las shops donde el usuario es propietario
   */
  findByOwner(ownerId: string): Promise<Shop[]>;

  /**
   * Verifica si un slug ya existe
   */
  existsBySlug(slug: string): Promise<boolean>;
}
