 export interface PasswordHasher {
  hashPassword(password: string): Promise<string>;
  verifyPassword(storedPassword: string, inputPassword: string): Promise<boolean>;
}
