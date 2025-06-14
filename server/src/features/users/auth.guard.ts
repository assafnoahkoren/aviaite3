import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtUtil } from '@services/jwt';
import type { Request } from 'express';
import type { User } from '../../../generated/prisma';

// Extend Express.Request to include a typed user property
export interface AuthedRequest extends Request {
  user: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = authHeader.slice(7);
    try {
      const decoded = JwtUtil.verifyUserJwt(token);
      req.user = decoded;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
} 