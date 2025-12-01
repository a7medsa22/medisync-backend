import { UserRole, UserStatus } from "@prisma/client";
import { AuthUser } from "./request-with-user.interface";



export interface AuthResponse{
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;

}