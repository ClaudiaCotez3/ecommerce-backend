import type { ShopRepository } from '../domain/ShopRepository';
import type { ShopUserRepository } from '../../shop-users/domain/ShopUserRepository';

export interface GetShopByIdInput {
  shopId: number;
  userId: string; // Para verificar permisos
}

/**
 * Caso de uso: Obtener shop por ID
 * Verifica que el usuario tenga permisos para ver la tienda
 */
export class GetShopById {
  constructor(
    private readonly shopRepository: ShopRepository,
    private readonly shopUserRepository: ShopUserRepository,
  ) {}

  async execute(input: GetShopByIdInput) {
    const shop = await this.shopRepository.findById(input.shopId);

    if (!shop) {
      throw new Error('Tienda no encontrada');
    }

    // Verificar si el usuario es el owner O miembro de la tienda
    if (shop.ownerId === input.userId) {
      // El usuario es el owner, tiene acceso completo
      return shop;
    }

    // Verificar si es miembro de la tienda con cualquier rol
    const membership = await this.shopUserRepository.findMembershipWithRole(
      input.userId,
      input.shopId
    );

    if (!membership) {
      throw new Error('No tienes permisos para ver esta tienda');
    }

    // El usuario es miembro, puede ver la tienda
    return shop;
  }
}
