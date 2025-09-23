import { UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";

export interface RequestWithUser extends Request{
    user:{
        id:string,
        email:string,
        role:UserRole,
        status:UserStatus,
        profile:any
    }
}