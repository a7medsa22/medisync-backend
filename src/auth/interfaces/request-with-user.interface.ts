import { UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import { JwtPayload } from "./jwt-payload.interface";

export interface AuthUser extends JwtPayload {
  profileAvg?: any; 
}
export interface RequestWithUser extends Request{
    user:AuthUser;
}