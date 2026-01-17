import { PrismaClient } from '@prisma/client';
import { 
  RegisterUser, 
  LoginUser, 
  BcryptPasswordHasher, 
  PrismaUserRepository, 
  JwtTokenService,
  DefaultIdGenerator,
  ValidationService
} from './index';

// Ejemplo de uso del módulo de autenticación
export class AuthModuleExample {
  private readonly prisma: PrismaClient;
  private readonly userRepository: PrismaUserRepository;
  private readonly passwordHasher: BcryptPasswordHasher;
  private readonly tokenService: JwtTokenService;
  private readonly idGenerator: DefaultIdGenerator;
  private readonly validationService: ValidationService;
  private readonly registerUser: RegisterUser;
  private readonly loginUser: LoginUser;

  constructor() {
    // Inicializar dependencias
    this.prisma = new PrismaClient();
    this.userRepository = new PrismaUserRepository(this.prisma);
    this.passwordHasher = new BcryptPasswordHasher();
    this.tokenService = new JwtTokenService();
    this.idGenerator = new DefaultIdGenerator();
    this.validationService = new ValidationService();
    
    // Inicializar casos de uso
    this.registerUser = new RegisterUser(
      this.userRepository, 
      this.passwordHasher, 
      this.idGenerator
    );
    this.loginUser = new LoginUser(
      this.userRepository, 
      this.passwordHasher, 
      this.tokenService
    );
  }

  // Ejemplo de registro de usuario
  async exampleRegister() {
    const registerResult = await this.registerUser.execute({
      email: 'user@example.com',
      password: 'securePassword123',
      firstName: 'John',
      lastName: 'Doe'
    });

    console.log('Register Result:', registerResult);
    return registerResult;
  }

  // Ejemplo de login de usuario
  async exampleLogin() {
    const loginResult = await this.loginUser.execute({
      email: 'user@example.com',
      password: 'securePassword123'
    });

    console.log('Login Result:', loginResult);
    return loginResult;
  }

  // Cleanup
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

// Exportar para uso en otros módulos
export default AuthModuleExample;
