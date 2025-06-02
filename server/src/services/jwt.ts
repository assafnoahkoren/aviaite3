import jwt from 'jsonwebtoken';
import { ENV } from './env';
import { User } from '../../generated/prisma';

export namespace JwtUtil {
  export function signUserJwt(user: Pick<User, 'id' | 'email' | 'fullName'>): string {
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    };
    return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '1d' });
  }
} 