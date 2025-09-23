import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginProvider } from "./providers/login.provider";
import { OtpProvider } from "./providers/otp.provider";
import { PasswordProvider } from "./providers/password.provider";
import { RegisterProvider } from "./providers/register.provider";
import { TokenProvider } from "./providers/token.provider";
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto, VerifyOtpDto } from "./dto/auth.dto";
import { UserRole, UserStatus } from "@prisma/client";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private loginProvider: LoginProvider,
    private registerProvider: RegisterProvider,
    private passwordProvider: PasswordProvider,
    private otpProvider: OtpProvider,
    private tokenProvider: TokenProvider,
    private prisma:PrismaService
  ) {}
  register(dto: RegisterDto){
    return this.registerProvider.signUp(dto)
  } 
  verifyRegistrationOtp(dto:VerifyOtpDto){
    return this.registerProvider.verifyRegistrationOtp(dto)
  }

  login(dto: LoginDto){
    return this.loginProvider.login(dto)
  }
  
  verifyLoginOtp(dto:VerifyOtpDto){
    return this.loginProvider.verifyLoginOtp(dto)
  }

  forgotPassword(dto:ForgotPasswordDto){
    return this.passwordProvider.forgotPassword(dto)
  }

  resetPassword(dto:ResetPasswordDto){
    return this.passwordProvider.resetPassword(dto)
  }

  refreshToken(refreshToken: string){
    return this.tokenProvider.refreshToken(refreshToken)
  }
  resendOtp(userId: string, type: string) {
    return this.otpProvider.resendOtp(userId, type);
  }

  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    return this.tokenProvider.validateJwtPayload(payload);
  }
  async validateUser(email: string, password: string): Promise<any> {
    return this.passwordProvider.validateUser(email, password);
  }
}