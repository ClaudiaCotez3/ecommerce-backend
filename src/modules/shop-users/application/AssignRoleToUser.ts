import { Injectable } from '@nestjs/common';
import type { ShopUserRepository } from '../domain/ShopUserRepository';

/**
 * Caso de uso: Asignar rol a usuario en tienda
 * Permite que el dueño/admin asigne roles a miembros
 */
@Injectable()
export class AssignRoleToUser {
  constructor(private readonly shopUserRepository: ShopUserRepository) {}

  async execute(params: {
    userId: string;
    shopId: number;
    roleId: number;
    assignedByUserId: string; // Para auditoría
  }) {
    const { userId, shopId, roleId } = params;

    // Verificar si ya existe membresía
    const existingMembership = await this.shopUserRepository.findMembership(
      userId,
      shopId
    );

    if (existingMembership) {
      // Cambiar rol existente
      return await this.shopUserRepository.changeRole(userId, shopId, roleId);
    } else {
      // Crear nueva membresía
      return await this.shopUserRepository.createMembership({
        userId,
        shopId,
        roleId,
      });
    }
  }
}
