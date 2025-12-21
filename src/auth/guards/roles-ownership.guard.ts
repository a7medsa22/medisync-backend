// auth/guards/ownership.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNER_KEY } from '../decorators/owner.decorator';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const paramKey = this.reflector.get<string>(
      OWNER_KEY,
      context.getHandler(),
    );

    // لو مفيش @Owner → نعدّي
    if (!paramKey) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const resourceOwnerId = request.params[paramKey];

    if (!user || !resourceOwnerId) {
      throw new ForbiddenException('Access denied');
    }

    if (user.sub !== resourceOwnerId) {
      throw new ForbiddenException('You do not own this resource');
    }

    return true;
  }
}
