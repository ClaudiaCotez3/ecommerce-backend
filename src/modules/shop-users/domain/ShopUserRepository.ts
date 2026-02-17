import { ShopMembership } from './ShopMembership';

/**
 * Interface del repositorio de ShopUser/ShopMembership
 * Define los contratos para gestionar membresías de usuarios en tiendas
 * NO depende de tecnologías específicas (Prisma, MongoDB, etc.)
 */
export interface ShopUserRepository {
  /**
   * Crea una nueva membresía (asigna usuario a shop con rol)
   */
  createMembership(membershipData: {
    userId: string;
    shopId: number;
    roleId: number;
  }): Promise<ShopMembership>;

  /**
   * Busca una membresía específica por usuario y shop
   */
  findMembership(userId: string, shopId: number): Promise<ShopMembership | null>;

  /**
   * Actualiza el rol de una membresía existente
   */
  changeRole(userId: string, shopId: number, newRoleId: number): Promise<ShopMembership>;

  /**
   * Lista todos los miembros de una shop con sus roles
   */
  listMembers(shopId: number): Promise<ShopMembershipWithDetails[]>;

  /**
   * Lista todas las shops donde el usuario es miembro
   */
  listShopsForUser(userId: string): Promise<ShopMembershipWithDetails[]>;

  /**
   * Verifica si ya existe una membresía para evitar duplicados
   */
  membershipExists(userId: string, shopId: number): Promise<boolean>;

  /**
   * Elimina una membresía (remover usuario de shop)
   */
  removeMembership(userId: string, shopId: number): Promise<void>;
}

/**
 * DTO para membresías con información adicional (para listados)
 */
export interface ShopMembershipWithDetails {
  membership: ShopMembership;
  userEmail: string;
  userName: string;
  roleName: string;
  shopName: string;
}
