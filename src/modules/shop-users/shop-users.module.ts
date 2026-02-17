import { Module } from '@nestjs/common';
import { PrismaService } from '../auth/infrastructure/prisma.service';

// Domain
import type { ShopUserRepository } from './domain/ShopUserRepository';
import type { RoleRepository } from './domain/Role';

// Application
import { AssignUserToShop } from './application/AssignUserToShop';
import { ChangeUserRoleInShop } from './application/ChangeUserRoleInShop';
import { ListShopMembers } from './application/ListShopMembers';

// Infrastructure
import { PrismaShopUserRepository } from './infrastructure/PrismaShopUserRepository';
import { PrismaRoleRepository } from './infrastructure/PrismaRoleRepository';
import { ShopUsersController } from './infrastructure/ShopUsersController';

/**
 * Módulo de ShopUsers
 * Gestiona la relación User ↔ Shop con roles
 * Configura la inyección de dependencias siguiendo principios hexagonales
 */
@Module({
  imports: [],
  controllers: [ShopUsersController],
  providers: [
    // Servicios de infraestructura
    PrismaService,
    
    // Repositorios
    {
      provide: 'ShopUserRepository',
      useClass: PrismaShopUserRepository,
    },
    
    {
      provide: 'RoleRepository',
      useClass: PrismaRoleRepository,
    },
    
    // Casos de uso
    {
      provide: AssignUserToShop,
      useFactory: (
        shopUserRepository: ShopUserRepository,
        roleRepository: RoleRepository,
      ) => {
        return new AssignUserToShop(shopUserRepository, roleRepository);
      },
      inject: ['ShopUserRepository', 'RoleRepository'],
    },
    
    {
      provide: ChangeUserRoleInShop,
      useFactory: (
        shopUserRepository: ShopUserRepository,
        roleRepository: RoleRepository,
      ) => {
        return new ChangeUserRoleInShop(shopUserRepository, roleRepository);
      },
      inject: ['ShopUserRepository', 'RoleRepository'],
    },
    
    {
      provide: ListShopMembers,
      useFactory: (shopUserRepository: ShopUserRepository) => {
        return new ListShopMembers(shopUserRepository);
      },
      inject: ['ShopUserRepository'],
    },
  ],
  exports: [
    'ShopUserRepository',
    'RoleRepository',
    AssignUserToShop,
    ChangeUserRoleInShop,
    ListShopMembers,
  ],
})
export class ShopUsersModule {}
