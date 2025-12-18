import { PrismaService } from "src/prisma/prisma.service";
import { LoginDto } from "../dto/auth.dto";
import * as bcrypt from 'bcryptjs';
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User, UserRole, UserStatus } from "@prisma/client";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { AuthResponse } from "../interfaces/auth-response.interface";
import { ConfigService } from "@nestjs/config";
import { TokenProvider } from "./token.provider";
import { use } from "passport";
import { UserWithRelations } from "src/common/utils/auth.type";

@Injectable()
export class LoginProvider {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private token: TokenProvider
  ) {}

  async login(user: UserWithRelations): Promise<AuthResponse> {


    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }


  const doctorId = user.doctor?.id ?? null;
  const patientId = user.patient?.id ?? null;
  

    // Check account status
      await this.checkAccountStatus(user);

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      doctorId,  
      patientId,
    };

    const accessToken = await this.token.generateAccessToken(payload);
    const refreshToken = await this.token.generateRefreshToken(user.id);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    return {
      user: {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        doctorId: doctorId ,
        patientId: patientId ,
      },
      accessToken,
      refreshToken,
      expiresIn: Number(this.config.get('JWT_EXPIRES_IN')),
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    // 1. حذف refresh token من DB
    await this.prisma.user.deleteMany({
      where: { id: userId },
    });
    return { message: 'Logged out successfully' };
  }

  private async checkAccountStatus(user:User): Promise<void> {
  switch (user.status) {
  case UserStatus.PENDING_EMAIL_VERIFICATION:
    throw new UnauthorizedException('Please verify your email before logging in.');

  case UserStatus.EMAIL_VERIFIED:  
    throw new UnauthorizedException('Please complete your profile before logging in.');

  case UserStatus.PENDING_ADMIN_APPROVAL:
    throw new UnauthorizedException('Your account is pending admin approval. Please wait.');

  case UserStatus.INACTIVE:
    throw new UnauthorizedException('Your account is inactive. Please contact support.');

  case UserStatus.SUSPENDED:
    throw new UnauthorizedException('Your account is suspended. Please contact support.');

  case UserStatus.ACTIVE:
    // continue
    break;

  default:
    throw new UnauthorizedException('Invalid account status. Please contact support.');
}
if (!user.isActive) {
  throw new UnauthorizedException('Account is not active. Please contact support.');
}

if (!user.isProfileComplete) {
  throw new UnauthorizedException('Please complete your profile before logging in.');
}
  }
}
