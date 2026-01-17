import { User } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';
import { PasswordHasher } from '../domain/PasswordHasher';
import { IdGenerator } from '../domain/IdGenerator';
import { ValidationService } from '../domain/ValidationService';

export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export class RegisterUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    try {
      // Validar email
      const emailValidation = ValidationService.validateEmail(request.email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          message: emailValidation.error!
        };
      }

      // Validar contraseña
      const passwordValidation = ValidationService.validatePassword(request.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.error!
        };
      }

      // Validar firstName
      const firstNameValidation = ValidationService.validateName(request.firstName, 'First name');
      if (!firstNameValidation.isValid) {
        return {
          success: false,
          message: firstNameValidation.error!
        };
      }

      // Validar lastName
      const lastNameValidation = ValidationService.validateName(request.lastName, 'Last name');
      if (!lastNameValidation.isValid) {
        return {
          success: false,
          message: lastNameValidation.error!
        };
      }

      // Verificar que el email no exista
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        return {
          success: false,
          message: 'Email already exists'
        };
      }

      // Hash de la contraseña
      const hashedPassword = await this.passwordHasher.hashPassword(request.password);

      // Generar ID único
      const userId = this.idGenerator.generateId();

      // Crear nuevo usuario
      const newUser = new User(
        userId,
        request.email,
        hashedPassword,
        request.firstName,
        request.lastName,
        new Date(),
        new Date()
      );

      // Guardar usuario
      await this.userRepository.save(newUser);

      return {
        success: true,
        message: 'User registered successfully',
        user: {
          id: newUser.getId(),
          email: newUser.getEmail(),
          firstName: newUser.getFirstName(),
          lastName: newUser.getLastName()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }
}
