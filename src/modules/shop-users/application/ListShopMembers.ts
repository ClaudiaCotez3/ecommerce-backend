import { ShopUserRepository, ShopMembershipWithDetails } from '../domain/ShopUserRepository';

/**
 * Caso de uso: Listar todos los miembros de una shop
 * Devuelve todos los usuarios que pertenecen a una tienda con sus roles
 */
export class ListShopMembers {
  constructor(private readonly shopUserRepository: ShopUserRepository) {}

  async execute(input: ListShopMembersInput): Promise<ShopMembershipWithDetails[]> {
    // Validar entrada
    this.validateInput(input);

    // Obtener todos los miembros de la shop
    const members = await this.shopUserRepository.listMembers(input.shopId);

    // Ordenar por rol y luego por nombre de usuario
    const sortedMembers = members.sort((a, b) => {
      // Primero por rol (admins primero, empleados después)
      const roleComparison = a.roleName.localeCompare(b.roleName);
      if (roleComparison !== 0) {
        return roleComparison;
      }
      
      // Luego por nombre de usuario
      return a.userName.localeCompare(b.userName);
    });

    return sortedMembers;
  }

  private validateInput(input: ListShopMembersInput): void {
    if (!input.shopId || input.shopId <= 0) {
      throw new Error('El ID de la tienda es requerido y debe ser válido');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface ListShopMembersInput {
  shopId: number;
}
