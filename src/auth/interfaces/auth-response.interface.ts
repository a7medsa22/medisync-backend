import { UserRole, UserStatus } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  profile?: any; // Patient or Doctor profile
}

export interface AuthResponse{
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;

}