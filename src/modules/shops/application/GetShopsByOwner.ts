import { Shop } from '../domain/Shop';
import { ShopRepository } from '../domain/ShopRepository';

/**
 * Caso de uso: Obtener shops por propietario
 * Devuelve todas las tiendas donde el usuario es propietario
 */
export class GetShopsByOwner {
  constructor(private readonly shopRepository: ShopRepository) {}

  async execute(input: GetShopsByOwnerInput): Promise<Shop[]> {
    // Validar entrada
    this.validateInput(input);

    // Obtener shops del propietario
    const shops = await this.shopRepository.findByOwner(input.ownerId);

    // Filtrar solo las shops activas (regla de negocio)
    const activeShops = shops.filter(shop => shop.isActive());

    return activeShops;
  }

  private validateInput(input: GetShopsByOwnerInput): void {
    if (!input.ownerId || input.ownerId.trim().length === 0) {
      throw new Error('El ID del propietario es requerido');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface GetShopsByOwnerInput {
  ownerId: string;
}
