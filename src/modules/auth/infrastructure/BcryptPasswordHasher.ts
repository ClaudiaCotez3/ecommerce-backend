import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../domain/PasswordHasher';

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds: number;

  constructor() {
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
  }

  async hashPassword(password: string): Promise<string> {
    try {
      if (!password) {
        throw new Error('Password cannot be empty');
      }

      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new Error(`Error hashing password: ${error}`);
    }
  }

  async verifyPassword(storedPassword: string, inputPassword: string): Promise<boolean> {
    try {
      if (!storedPassword || !inputPassword) {
        return false;
      }

      return await bcrypt.compare(inputPassword, storedPassword);
    } catch (error) {
      throw new Error(`Error verifying password: ${error}`);
    }
  }

  async isHashValid(hash: string): Promise<boolean> {
    try {
      // Verificar si el hash tiene el formato correcto de bcrypt
      const bcryptRegex = /^\$2[ayb]\$.{56}$/;
      return bcryptRegex.test(hash);
    } catch (error) {
      return false;
    }
  }

  getSaltRounds(): number {
    return this.saltRounds;
  }
}
