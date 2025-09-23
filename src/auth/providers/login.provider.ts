import { PrismaService } from "src/prisma/prisma.service";
import { OtpProvider } from "./otp.provider";
import { LoginDto, VerifyOtpDto } from "../dto/auth.dto";
import * as bcrypt from 'bcryptjs';
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { UserRole, UserStatus } from "@prisma/client";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { AuthResponse } from "../interfaces/auth-response.interface";
import { ConfigService } from "@nestjs/config";
import { TokenProvider } from "./token.provider";


export class LoginProvider {
      constructor(
    private prisma: PrismaService,
    private otp: OtpProvider,
    private configService:ConfigService,
    private token:TokenProvider

  ) {}
async login(dto: LoginDto): Promise<{ message: string; userId: string; requiresOtp: boolean }> {
    const { email, password } = dto;

    // Find user
     const user = await this.prisma.user.findUniqueOrThrow({
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


    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Check if user is approved
    if (user.status !== UserStatus.APPROVED) {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}. Please contact support.`);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated. Please contact support.');
    }

    // Generate and send login OTP
    await this.otp.generateAndSendOtp(user.id, 'LOGIN_VERIFICATION');
   
return {
      message: 'Please check your email for verification code to complete login.',
      userId: user.id,
      requiresOtp: true,
    };
  }
   async verifyLoginOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthResponse> {
    const { userId, otp } = verifyOtpDto;

    const isValid = await this.otp.verifyOtp(userId, otp, 'LOGIN_VERIFICATION');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Get user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      throw new UnauthorizedException('User not found');
    }

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
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
      expiresIn: Number(this.configService.get('JWT_EXPIRES_IN', '15m')),
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
  return { message: 'Logged out successfully' };
}

}