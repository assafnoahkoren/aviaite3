import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../../generated/prisma';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthedRequest } from '../auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const user = request.user;
    
    if (!user) {
      return false;
    }
    
    return requiredRoles.includes(user.role);
  }
}