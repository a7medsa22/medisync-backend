import { PrismaService } from "src/prisma/prisma.service";
import { LoginDto } from "../dto/auth.dto";
import * as bcrypt from 'bcryptjs';
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User, UserRole, UserStatus } from "@prisma/client";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { AuthResponse } from "../interfaces/auth-response.interface";
import { ConfigService } from "@nestjs/config";
import { TokenProvider } from "./token.provider";

@Injectable()
export class LoginProvider {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private token: TokenProvider
  ) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const { email, password } = dto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        doctor: {
          include: {
            specialization: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
      
     // 2. جيب doctorId لو الـ user doctor
  let doctorId: string | null = null;
  let patientId: string | null = null;

  if (user.role === UserRole.DOCTOR) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: user.id }
    });
     doctorId = doctor?.id || null; 
  }

  if (user.role === UserRole.PATIENT) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: user.id }
    });
    patientId = patient?.id || null;
  }

    // Check account status
      await this.checkAccountStatus(user);

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      doctorId,  // new add
      patientId  // new add
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
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        profile: user.role === UserRole.PATIENT ? user.patient : user.doctor,
        },
      accessToken,  
      refreshToken,
      expiresIn: Number(this.config.get('JWT_EXPIRES_IN')),
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    // هنا ممكن نضيف logic لمسح refresh token من DB لو بتخزنها
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
