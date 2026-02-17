import { ShopMembership } from '../domain/ShopMembership';
import { ShopUserRepository } from '../domain/ShopUserRepository';
import { RoleRepository } from '../domain/Role';

/**
 * Caso de uso: Asignar usuario a una shop con un rol específico
 * Encapsula toda la lógica de negocio para crear membresías
 */
export class AssignUserToShop {
  constructor(
    private readonly shopUserRepository: ShopUserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(input: AssignUserToShopInput): Promise<ShopMembership> {
    // Validar datos de entrada
    this.validateInput(input);

    // Verificar que el rol exista
    const role = await this.roleRepository.findById(input.roleId);
    if (!role) {
      throw new Error(`El rol con ID ${input.roleId} no existe`);
    }

    // Verificar que NO exista una membresía previa
    const existingMembership = await this.shopUserRepository.membershipExists(
      input.userId,
      input.shopId
    );

    if (existingMembership) {
      throw new Error(
        `El usuario ya es miembro de la tienda con ID ${input.shopId}`
      );
    }

    // Crear la entidad de dominio
    const membershipData = ShopMembership.create(
      input.userId,
      input.shopId,
      input.roleId
    );

    // Crear la membresía en el repositorio
    const createdMembership = await this.shopUserRepository.createMembership(membershipData);

    return createdMembership;
  }

  private validateInput(input: AssignUserToShopInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('El ID del usuario es requerido');
    }

    if (!input.shopId || input.shopId <= 0) {
      throw new Error('El ID de la tienda es requerido y debe ser válido');
    }

    if (!input.roleId || input.roleId <= 0) {
      throw new Error('El ID del rol es requerido y debe ser válido');
    }

    // Validar que el userId no sea el mismo que está haciendo la operación en casos específicos
    // Esta regla se puede ajustar según los requerimientos del negocio
  }
}

/**
 * DTO para la entrada del caso de uso
 */
export interface AssignUserToShopInput {
  userId: string;
  shopId: number;
  roleId: number;
}
