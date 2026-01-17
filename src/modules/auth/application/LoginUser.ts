import { UserRepository } from '../domain/UserRepository';
import { PasswordHasher } from '../domain/PasswordHasher';
import { JwtTokenService } from '../infrastructure/JwtTokenService';

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
    private readonly tokenService: JwtTokenService
  ) {}

  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    try {
      // Validar formato de email
      if (!this.isValidEmail(request.email)) {
        return {
          success: false,
          message: 'Invalid email format'
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
