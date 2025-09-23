import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

@Injectable()
export class ApprovedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    if (user.status !== UserStatus.APPROVED) {
      throw new ForbiddenException(`Account is ${user.status.toLowerCase()}. Please contact support.`);
    }

    return true;
  }
}