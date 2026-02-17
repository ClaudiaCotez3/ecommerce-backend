import { ShopMembership } from '../domain/ShopMembership';
import { ShopUserRepository } from '../domain/ShopUserRepository';
import { RoleRepository } from '../domain/Role';

/**
 * Caso de uso: Cambiar el rol de un usuario en una shop
 * Actualiza el rol de una membresía existente
 */
export class ChangeUserRoleInShop {
  constructor(
    private readonly shopUserRepository: ShopUserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(input: ChangeUserRoleInput): Promise<ShopMembership> {
    // Validar datos de entrada
    this.validateInput(input);

    // Verificar que la membresía exista
    const existingMembership = await this.shopUserRepository.findMembership(
      input.userId,
      input.shopId
    );

    if (!existingMembership) {
      throw new Error(
        `No existe membresía para el usuario en la tienda con ID ${input.shopId}`
      );
    }

    // Verificar que el nuevo rol exista
    const newRole = await this.roleRepository.findById(input.roleId);
    if (!newRole) {
      throw new Error(`El rol con ID ${input.roleId} no existe`);
    }

    // Verificar que no sea el mismo rol (opcional, según reglas de negocio)
    if (existingMembership.hasRole(input.roleId)) {
      throw new Error(
        `El usuario ya tiene el rol especificado en esta tienda`
      );
    }

    // Actualizar el rol en el repositorio
    const updatedMembership = await this.shopUserRepository.changeRole(
      input.userId,
      input.shopId,
      input.roleId
    );

    return updatedMembership;
  }

  private validateInput(input: ChangeUserRoleInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('El ID del usuario es requerido');
    }

    if (!input.shopId || input.shopId <= 0) {
      throw new Error('El ID de la tienda es requerido y debe ser válido');
    }

    if (!input.roleId || input.roleId <= 0) {
      throw new Error('El ID del nuevo rol es requerido y debe ser válido');
    }
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface ChangeUserRoleInput {
  userId: string;
  shopId: number;
  roleId: number;
}
