import { UserRole, UserStatus } from '@prisma/client';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: UserRole;
  status: UserStatus;
  iat?: number; // issued at
  exp?: number; // expires at
}
