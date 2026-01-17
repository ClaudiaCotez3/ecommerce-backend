import * as jwt from 'jsonwebtoken';
import { User } from '../domain/User';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class JwtTokenService {
  private readonly secretKey: string;
  private readonly expiresIn: string;

  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'your-secret-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  generateToken(user: User): string {
    try {
      const payload = {
        userId: user.getId(),
        email: user.getEmail()
      };

      return jwt.sign(payload, this.secretKey, {
        expiresIn: this.expiresIn
      });
    } catch (error) {
      throw new Error(`Error generating token: ${error}`);
    }
  }

  verifyToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      try {
        jwt.verify(token, this.secretKey, (err: any, decoded: any) => {
          if (err) {
            reject(new Error(`Invalid token: ${err.message}`));
            return;
          }

          const payload = decoded as JwtPayload;
          resolve(payload);
        });
      } catch (error) {
        reject(new Error(`Error verifying token: ${error}`));
      }
    });
  }

  extractTokenFromHeader(authHeader: string): string | null {
    try {
      if (!authHeader) {
        return null;
      }

      const [bearer, token] = authHeader.split(' ');
      
      if (bearer !== 'Bearer' || !token) {
        return null;
      }

      return token;
    } catch (error) {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  refreshToken(token: string): string {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      
      if (!decoded) {
        throw new Error('Invalid token for refresh');
      }

      const newPayload = {
        userId: decoded.userId,
        email: decoded.email
      };

      return jwt.sign(newPayload, this.secretKey, {
        expiresIn: this.expiresIn
      });
    } catch (error) {
      throw new Error(`Error refreshing token: ${error}`);
    }
  }
}
