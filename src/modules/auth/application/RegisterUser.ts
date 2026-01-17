import { User } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';
import { PasswordHasher } from '../domain/PasswordHasher';

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
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    try {
      // Validar que el email no exista
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        return {
          success: false,
          message: 'Email already exists'
        };
      }

      // Validar formato de email
      if (!this.isValidEmail(request.email)) {
        return {
          success: false,
          message: 'Invalid email format'
        };
      }

      // Validar contraseña
      if (!this.isValidPassword(request.password)) {
        return {
          success: false,
          message: 'Password must be at least 8 characters long'
        };
      }

      // Hash de la contraseña
      const hashedPassword = await this.passwordHasher.hashPassword(request.password);

      // Crear nuevo usuario
      const newUser = new User(
        crypto.randomUUID(),
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    return password.length >= 8;
  }
}
