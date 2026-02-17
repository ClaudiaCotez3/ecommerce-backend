import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/infrastructure/prisma.service';
import { Role, RoleRepository } from '../domain/Role';

/**
 * Implementación del repositorio de Role usando Prisma
 */
@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return null;
    }

    return this.mapToDomainEntity(role);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.prisma.role.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (!role) {
      return null;
    }

    return this.mapToDomainEntity(role);
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });

    return roles.map(role => this.mapToDomainEntity(role));
  }

  async exists(id: number): Promise<boolean> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!role;
  }

  /**
   * Mapea del modelo Prisma a la entidad de dominio
   */
  private mapToDomainEntity(prismaRole: any): Role {
    return new Role(
      prismaRole.id,
      prismaRole.name,
      prismaRole.description,
      prismaRole.createdAt,
    );
  }
}
