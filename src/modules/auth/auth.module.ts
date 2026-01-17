import { Module } from '@nestjs/common';
import { AuthController } from './infrastructure/AuthController';
import { RegisterUser } from './application/RegisterUser';
import { LoginUser } from './application/LoginUser';
import { PrismaUserRepository } from './infrastructure/PrismaUserRepository';
import { BcryptPasswordHasher } from './infrastructure/BcryptPasswordHasher';
import { JwtTokenService } from './infrastructure/JwtTokenService';
import { DefaultIdGenerator } from './infrastructure/IdGeneratorImpl';
import { ValidationService } from './domain/ValidationService';
import { PrismaService } from './infrastructure/prisma.service';
import type { UserRepository } from './domain/UserRepository';
import type { PasswordHasher } from './domain/PasswordHasher';
import type { TokenService } from './domain/TokenService';
import type { IdGenerator } from './domain/IdGenerator';

@Module({
  controllers: [AuthController],
  providers: [
    // Prisma
    PrismaService,
    
    // Repositorios
    {
      provide: 'UserRepository',
      useFactory: (prisma: PrismaService) => new PrismaUserRepository(prisma),
      inject: [PrismaService],
    },
    
    // Servicios de infraestructura
    {
      provide: 'PasswordHasher',
      useClass: BcryptPasswordHasher,
    },
    {
      provide: 'TokenService',
      useClass: JwtTokenService,
    },
    {
      provide: 'IdGenerator',
      useClass: DefaultIdGenerator,
    },
    
    // Servicios de dominio
    ValidationService,
    
    // Casos de uso
    {
      provide: RegisterUser,
      useFactory: (
        userRepository: UserRepository,
        passwordHasher: PasswordHasher,
        idGenerator: IdGenerator,
      ) => new RegisterUser(userRepository, passwordHasher, idGenerator),
      inject: ['UserRepository', 'PasswordHasher', 'IdGenerator'],
    },
    {
      provide: LoginUser,
      useFactory: (
        userRepository: UserRepository,
        passwordHasher: PasswordHasher,
        tokenService: TokenService,
      ) => new LoginUser(userRepository, passwordHasher, tokenService),
      inject: ['UserRepository', 'PasswordHasher', 'TokenService'],
    },
  ],
})
export class AuthModule {}
