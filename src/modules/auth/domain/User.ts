import { PasswordHasher } from './PasswordHasher';

export class User {
  constructor(
    private readonly id: string,
    private readonly email: string,
    private readonly password: string,
    private readonly firstName: string,
    private readonly lastName: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date
  ) {}

  // Getters
  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Métodos de negocio
  async validatePassword(inputPassword: string, passwordHasher: PasswordHasher): Promise<boolean> {
    return await passwordHasher.verifyPassword(this.password, inputPassword);
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  // Método para crear una nueva instancia con datos actualizados
  updateLastLogin(lastLoginAt: Date): User {
    return new User(
      this.id,
      this.email,
      this.password,
      this.firstName,
      this.lastName,
      this.createdAt,
      lastLoginAt
    );
  }

  // Método para validar la integridad del objeto
  isValid(): boolean {
    return (
      this.id.length > 0 &&
      this.isEmailValid() &&
      this.password.length > 0 &&
      this.firstName.length > 0 &&
      this.lastName.length > 0
    );
  }
}
