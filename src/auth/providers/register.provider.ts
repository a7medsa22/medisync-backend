import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import  {RegisterDto, VerifyOtpDto } from '../dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';
import { OtpProvider } from './otp.provider';


@Injectable()
export class RegisterProvider {
     constructor(
    private prisma: PrismaService,
    private otp: OtpProvider,
  ) {}

    public async signUp(dto:RegisterDto): Promise<{ message: string; userId: string }> {
    const { email, password, firstName, lastName, phone, nationalId, role } = dto;
        const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { nationalId: nationalId || undefined },
        ],
      },
    });
      if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      if (existingUser.nationalId === nationalId) {
        throw new ConflictException('National ID already registered');
      }
    }

        const haspassword = await bcrypt.hash(password,12);

        const user = await this.prisma.user.create({
          data: {
            email,
            password: haspassword,
            firstName,
            lastName,
            phone,
            nationalId,
            role:role || UserRole.PATIENT,
            status:UserStatus.PENDING,
            isActive:false,
          },
        });
        // Create role-specific profile
    if (user.role === UserRole.PATIENT) {
      await this.prisma.patient.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Generate and send OTP for email verification
    await this.otp.generateAndSendOtp(user.id, 'EMAIL_VERIFICATION');

  return {
      message: 'Registration successful. Please wait for admin approval.',
      userId: user.id,
    };
  } 
   async verifyRegistrationOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
    const { userId, otp } = dto;

    const isValid = await this.otp.verifyOtp(userId, otp, 'EMAIL_VERIFICATION');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Update user status to approved (or keep pending for admin approval)
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        status: UserStatus.PENDING, // Still needs admin approval
        isActive: true,
        // Add email verification flag if needed
      },
    });

    return {
      message: 'Email verified successfully. Your account is pending admin approval.',
    };
  }
}
