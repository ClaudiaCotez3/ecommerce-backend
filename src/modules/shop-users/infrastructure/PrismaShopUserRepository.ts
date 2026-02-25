import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/infrastructure/prisma.service';
import { ShopMembership } from '../domain/ShopMembership';
import { ShopUserRepository, ShopMembershipWithDetails, MembershipWithRole } from '../domain/ShopUserRepository';

/**
 * Implementación del repositorio de ShopUser usando Prisma
 * Mapea entre la entidad de dominio y el modelo de Prisma
 */
@Injectable()
export class PrismaShopUserRepository implements ShopUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMembership(membershipData: {
    userId: string;
    shopId: number;
    roleId: number;
  }): Promise<ShopMembership> {
    const createdMembership = await this.prisma.shopUser.create({
      data: {
        userId: membershipData.userId,
        shopId: membershipData.shopId,
        roleId: membershipData.roleId,
      },
    });

    return this.mapToDomainEntity(createdMembership);
  }

  async findMembership(userId: string, shopId: number): Promise<ShopMembership | null> {
    const membership = await this.prisma.shopUser.findUnique({
      where: {
        userId_shopId: {
          userId,
          shopId,
        },
      },
    });

    if (!membership) {
      return null;
    }

    return this.mapToDomainEntity(membership);
  }

  async changeRole(userId: string, shopId: number, newRoleId: number): Promise<ShopMembership> {
    const updatedMembership = await this.prisma.shopUser.update({
      where: {
        userId_shopId: {
          userId,
          shopId,
        },
      },
      data: {
        roleId: newRoleId,
      },
    });

    return this.mapToDomainEntity(updatedMembership);
  }

  async listMembers(shopId: number): Promise<ShopMembershipWithDetails[]> {
    const memberships = await this.prisma.shopUser.findMany({
      where: { shopId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        role: {
          select: {
            name: true,
          },
        },
        shop: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { role: { name: 'asc' } },
        { user: { firstName: 'asc' } },
      ],
    });

    return memberships.map(membership => ({
      membership: this.mapToDomainEntity({
        id: membership.id,
        userId: membership.userId,
        shopId: membership.shopId,
        roleId: membership.roleId,
        assignedAt: membership.assignedAt,
      }),
      userEmail: membership.user.email,
      userName: `${membership.user.firstName} ${membership.user.lastName}`,
      roleName: membership.role.name,
      shopName: membership.shop.name,
    }));
  }

  async listShopsForUser(userId: string): Promise<ShopMembershipWithDetails[]> {
    const memberships = await this.prisma.shopUser.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        role: {
          select: {
            name: true,
          },
        },
        shop: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { shop: { name: 'asc' } },
        { role: { name: 'asc' } },
      ],
    });

    return memberships.map(membership => ({
      membership: this.mapToDomainEntity({
        id: membership.id,
        userId: membership.userId,
        shopId: membership.shopId,
        roleId: membership.roleId,
        assignedAt: membership.assignedAt,
      }),
      userEmail: membership.user.email,
      userName: `${membership.user.firstName} ${membership.user.lastName}`,
      roleName: membership.role.name,
      shopName: membership.shop.name,
    }));
  }

  async membershipExists(userId: string, shopId: number): Promise<boolean> {
    const membership = await this.prisma.shopUser.findUnique({
      where: {
        userId_shopId: {
          userId,
          shopId,
        },
      },
      select: { id: true },
    });

    return !!membership;
  }

  async removeMembership(userId: string, shopId: number): Promise<void> {
    await this.prisma.shopUser.delete({
      where: {
        userId_shopId: {
          userId,
          shopId,
        },
      },
    });
  }

  async findMembershipWithRole(userId: string, shopId: number): Promise<MembershipWithRole | null> {
    const membershipWithRole = await this.prisma.shopUser.findUnique({
      where: {
        userId_shopId: {
          userId,
          shopId,
        },
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!membershipWithRole) {
      return null;
    }

    return {
      membership: this.mapToDomainEntity(membershipWithRole),
      role: {
        id: membershipWithRole.role.id,
        name: membershipWithRole.role.name,
        description: membershipWithRole.role.description,
      },
    };
  }

  /**
   * Mapea del modelo Prisma a la entidad de dominio
   */
  private mapToDomainEntity(prismaShopUser: any): ShopMembership {
    return new ShopMembership(
      prismaShopUser.id,
      prismaShopUser.userId,
      prismaShopUser.shopId,
      prismaShopUser.roleId,
      prismaShopUser.assignedAt,
    );
  }
}
