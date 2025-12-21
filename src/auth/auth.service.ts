import { Injectable } from '@nestjs/common';
import { LoginProvider } from './providers/login.provider';
import { OtpProvider } from './providers/otp.provider';
import { PasswordProvider } from './providers/password.provider';
import { RegisterProvider } from './providers/register.provider';
import { TokenProvider } from './providers/token.provider';
import {
  CompleteProfileDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterBasicDto,
  RegisterInitDto,
  RegisterVerifyEmailDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import { User, UserRole } from '@prisma/client';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserWithRelations } from 'src/common/utils/auth.type';
import { Request } from 'express';
import { use } from 'passport';

@Injectable()
export class AuthService {
  constructor(
    private loginProvider: LoginProvider,
    private registerProvider: RegisterProvider,
    private passwordProvider: PasswordProvider,
    private otpProvider: OtpProvider,
    private tokenProvider: TokenProvider,
    private prisma: PrismaService,
  ) { }

  ///////////////////
  // Registration //
  //////////////////
  registerInit(dto: RegisterInitDto) {
    return this.registerProvider.registerInit(dto);
  }
  registerBasic(dto: RegisterBasicDto) {
    return this.registerProvider.registerBasic(dto);
  }
  registerVerifyEmail(dto: RegisterVerifyEmailDto) {
    return this.registerProvider.registerVerifyEmail(dto);
  }
  completeUserProfile(userId: string, dto: CompleteProfileDto) {
    return this.registerProvider.completeUserProfile(userId, dto);
  }

  /////////////////
  // Authentication //
  /////////////////
  login(user: UserWithRelations, req: Request) {
    return this.loginProvider.login(user, req);
  }

  //////////////////
  // Password Management //
  //////////////////
  forgotPassword(dto: ForgotPasswordDto) {
    return this.passwordProvider.forgotPassword(dto);
  }

  resetPassword(dto: ResetPasswordDto) {
    return this.passwordProvider.resetPassword(dto);
  }
  verifyResetPasswordOtp(dto: VerifyOtpDto) {
    return this.passwordProvider.verifyResetPasswordOtp(dto);
  }

  //////////////////
  // Token Management //
  //////////////////
  async validateRefreshToken(userId: string, tokenId: string) {
    return this.tokenProvider.validateRefreshToken(userId, tokenId);
  }
  async refreshTokens(userId: string, tokenId: string) {
    return this.tokenProvider.refreshTokens(userId, tokenId);
  }

  //////////////////
  // Session Management //
  //////////////////
  async getUserSessions(userId: string) {
    return this.tokenProvider.getUserSessions(userId);
  }
  async revokeSession(userId: string, tokenId: string) {
    return this.tokenProvider.revokeSession(userId, tokenId);
  }

  //////////////////
  // OTP Management //
  //////////////////
  resendOtp(userId: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') {
    return this.otpProvider.resendOtp(userId, type);
  }
  //// Validate JWT payload and return user info
  async validateJwtPayload(userId: string): Promise<any> {
    return this.tokenProvider.validateJwtPayload(userId);
  }
  async validateUser(email: string, password: string): Promise<any> {
    return this.passwordProvider.validateUser(email, password);
  }
  //////////////////
  // Change Password //
  //////////////////
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    return this.passwordProvider.changePassword(
      userId,
      oldPassword,
      newPassword,
    );
  }
  //////////////////
  // Logout //
  //////////////////
  async logout(userId: string): Promise<{ message: string }> {
    return this.loginProvider.logout(userId);
  }
  // Revoke all sessions
  async revokeAllSessions(userId: string) {
    return this.tokenProvider.revokeAllSessions(userId);
  }
}
