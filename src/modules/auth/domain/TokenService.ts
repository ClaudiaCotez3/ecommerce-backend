import { User } from './User';

export interface TokenService {
  generateToken(user: User): string;
  verifyToken(token: string): Promise<TokenPayload>;
  extractTokenFromHeader(authHeader: string): string | null;
  isTokenExpired(token: string): boolean;
  refreshToken(token: string): string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
