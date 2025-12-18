import { Injectable } from "@nestjs/common";
import { LoginProvider } from "./providers/login.provider";
import { OtpProvider } from "./providers/otp.provider";
import { PasswordProvider } from "./providers/password.provider";
import { RegisterProvider } from "./providers/register.provider";
import { TokenProvider } from "./providers/token.provider";
import { CompleteProfileDto, ForgotPasswordDto, LoginDto, RegisterBasicDto, RegisterInitDto, RegisterVerifyEmailDto, ResetPasswordDto, VerifyOtpDto } from "./dto/auth.dto";
import { UserRole } from "@prisma/client";
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
  registerInit(dto: RegisterInitDto){
    return this.registerProvider.registerInit(dto)
  } 
  registerBasic(dto: RegisterBasicDto){
    return this.registerProvider.registerBasic(dto)
  } 
  registerVerifyEmail(dto: RegisterVerifyEmailDto){
    return this.registerProvider.registerVerifyEmail(dto)
  } 
  completeUserProfile(userId:string ,dto: CompleteProfileDto){
    return this.registerProvider.completeUserProfile(userId,dto)
  } 


  login(dto: LoginDto){
    return this.loginProvider.login(dto)
  }
  

  forgotPassword(dto:ForgotPasswordDto){
    return this.passwordProvider.forgotPassword(dto)
  }

  resetPassword(dto:ResetPasswordDto){
    return this.passwordProvider.resetPassword(dto)
  }
  verifyResetPasswordOtp(dto:VerifyOtpDto){
    return this.passwordProvider.verifyResetPasswordOtp(dto)
  }

  refreshToken(refreshToken: string){
    return this.tokenProvider.refreshToken(refreshToken)
  }
  resendOtp(userId: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') {
    return this.otpProvider.resendOtp(userId, type);
  }

  async validateJwtPayload(userId: string): Promise<any> {
    return this.tokenProvider.validateJwtPayload(userId);
  }
  async validateUser(email: string, password: string): Promise<any> {
    return this.passwordProvider.validateUser(email, password);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string){
    return this.passwordProvider.changePassword(userId, oldPassword, newPassword)
  }
  async logout(userId: string): Promise<{ message: string }> {
    return this.loginProvider.logout(userId);
  }
  
}