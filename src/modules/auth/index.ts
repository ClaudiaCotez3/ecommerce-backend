// Auth Module Barrel Export
// This file exports all the main components of the auth module

// Application Layer
export { RegisterUser } from './application/RegisterUser';
export { LoginUser } from './application/LoginUser';

// Domain Layer
export { User } from './domain/User';
export type { UserRepository } from './domain/UserRepository';
export type { PasswordHasher } from './domain/PasswordHasher';
export type { TokenService, TokenPayload } from './domain/TokenService';
export type { IdGenerator } from './domain/IdGenerator';
export { ValidationService } from './domain/ValidationService';

// Infrastructure Layer
export { AuthController } from './infrastructure/AuthController';
export { PrismaUserRepository } from './infrastructure/PrismaUserRepository';
export { JwtTokenService } from './infrastructure/JwtTokenService';
export { BcryptPasswordHasher } from './infrastructure/BcryptPasswordHasher';
export { DefaultIdGenerator } from './infrastructure/IdGeneratorImpl';
