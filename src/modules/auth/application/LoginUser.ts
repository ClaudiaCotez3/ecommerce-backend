import { User } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';
import { PasswordHasher } from '../domain/PasswordHasher';
import { TokenService } from '../domain/TokenService';
import { ValidationService } from '../domain/ValidationService';

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export class LoginUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    try {
      // Validar formato de email
      const emailValidation = ValidationService.validateEmail(request.email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          message: 'Invalid credentials'  // No revelar detalles específicos por seguridad
        };
      }

      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      // Verificar contraseña
      const isValidPassword = await user.validatePassword(request.password, this.passwordHasher);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      // Generar token JWT
      const token = this.tokenService.generateToken(user);

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.getId(),
          email: user.getEmail(),
          firstName: user.getFirstName(),
          lastName: user.getLastName()
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
