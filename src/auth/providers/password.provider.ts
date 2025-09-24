
import * as bcrypt from 'bcryptjs';
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ForgotPasswordDto, ResetPasswordDto, VerifyOtpDto } from '../dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtpProvider } from './otp.provider';
import { ConfigService } from '@nestjs/config';
import { TokenProvider } from './token.provider';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PasswordProvider {
    constructor(
    private prisma: PrismaService,
    private otp: OtpProvider,
    private configService:ConfigService,
    private jwtService:JwtService,
    private token:TokenProvider

  ) {}
 async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; userId: string }> {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: 'If this email exists, you will receive a password reset code.',
        userId: '',
      };
    }

    // Generate and send password reset OTP
    await this.otp.generateAndSendOtp(user.id, 'PASSWORD_RESET');

    return {
      message: 'Password reset code sent to your email.',
      userId: user.id,
    };
  }

  async verifyResetPasswordOtp(dto: VerifyOtpDto): Promise<{ message: string; resetToken: string }> {
    const { userId, otp } = dto;

    const isValid = await this.otp.verifyOtp(userId, otp, 'PASSWORD_RESET');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    // Generate temporary reset token (valid for 15 minutes)
    const resetToken = this.jwtService.sign(
      { userId, type: 'PASSWORD_RESET' },
      { 
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m' 
      }
    );

    return {
      message: 'Reset code verified. You can now set a new password.',
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const { resetToken, newPassword } = dto;

    try {
      const decoded = this.jwtService.verify(resetToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (decoded.type !== 'PASSWORD_RESET') {
        throw new BadRequestException('Invalid reset token');
      }

      const userId = decoded.userId;

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      // Clean up any existing OTPs for this user
      await this.prisma.otp.deleteMany({
        where: { userId },
      });

      return {
        message: 'Password reset successfully. You can now login with your new password.',
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
  async validateUser(email: string, password: string): Promise<any> {
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (user && await bcrypt.compare(password, user.password)) {
    const { password, ...result } = user;
    return result;
  }
  return null;
}

// change password with out OTP
async changePassword(
  userId: string, 
  oldPassword: string, 
  newPassword: string
): Promise<{ message: string }> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new BadRequestException('User not found');
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    throw new BadRequestException('Current password is incorrect');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  await this.prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return { message: 'Password changed successfully' };
}
}
