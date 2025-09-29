import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import  {CompleteProfileDto, RegisterBasicDto, RegisterInitDto, RegisterVerifyEmailDto, VerifyOtpDto } from '../dto/auth.dto';
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

   /**
    * 
    * @param dto RegisterInitDto 
    * @returns { success: boolean; message: string; data: { tempUserId: string; role: UserRole; status: string } }
    */
  async registerInit(dto: RegisterInitDto): Promise<{ 
    success: boolean; 
    message: string; 
    data: { tempUserId: string; role: UserRole; status: string } 
  }> {
    const { role } = dto;

    // Create temporary user with just role
    const tempUser = await this.prisma.user.create({
      data: {
        email: `temp_${Date.now()}@temp.com`, // Temporary email
        password: 'temp_password', // Temporary password
        firstName: 'Temp',
        lastName: 'User',
        role,
        status: UserStatus.INIT,
        registrationStep: 0,
        isActive: false,
        isProfileComplete: false,
      },
    });

    return {
      success: true,
      message: 'Role selected. Proceed with registration.',
      data: {
        tempUserId: tempUser.id,
        role: tempUser.role,
        status: tempUser.status,
      },
    };
  }

   /*Step 2: Register basic info (email, password, name) */
  
  async registerBasic(dto: RegisterBasicDto): Promise<{
  message: string; 
  data: { userId: string; status: string }  }> {
    const { tempUserId, email, password, confirmPassword, firstName, lastName } = dto;

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if temp user exists
    const tempUser = await this.prisma.user.findUnique({
      where: { id: tempUserId },
    });

    if (!tempUser || tempUser.status !== UserStatus.INIT) {
      throw new BadRequestException('Invalid registration session');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

     if (existingUser && existingUser.id !== tempUserId) {
    throw new ConflictException('Email already registered');
  }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update temp user with real data
    const updatedUser = await this.prisma.user.update({
      where: { id: tempUserId },
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        status: UserStatus.PENDING_EMAIL_VERIFICATION,
        registrationStep: 1,
      },
    });

    // Generate and send email verification OTP
    await this.otp.generateAndSendOtp(updatedUser.id, 'EMAIL_VERIFICATION');

    return {
      
    message: 'Basic info saved. Please verify your email.', 
     data: {
      userId: updatedUser.id,
      status: updatedUser.status,
    },
  }
}

   /**
    * 
    * @param dto RegisterVerifyEmailDto 
    * @returns { success: boolean; message: string; data: { userId: string; status: string } }
    */
   async registerVerifyEmail(dto: RegisterVerifyEmailDto): Promise<{
    data: { userId: string; status: string ,message: string}
  }> {
    const { userId, otp } = dto;

    const isValid = await this.otp.verifyOtp(userId, otp, 'EMAIL_VERIFICATION');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Update user status to approved (or keep pending for admin approval)
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        status: UserStatus.EMAIL_VERIFIED, // Still needs admin approval
        registrationStep: 2,
        // Add email verification flag if needed
      },
    });

   return {
      data: {
        userId,
        status: 'EMAIL_VERIFIED',
        message: 'Email verified successfully. Please complete your profile.',  
      },
    };
  }
   
   /**
    * (Step 4)
    * @param userId string 
    * @param dto CompleteProfileDto 
    * @returns { success: boolean; message: string; data: { userId: string; status: string } }
    */
  async completeUserProfile(userId: string, dto: CompleteProfileDto): Promise<{
    data: { userId: string; status: string, message: string };
  }> {
    const { phone, nationalId, medicalCardNumber } = dto;

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status !== UserStatus.EMAIL_VERIFIED) {
      throw new BadRequestException('Invalid user or email not verified');
    }

    // Check if nationalId already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        nationalId,
        id: { not: userId },
      },
    });

    if (existingUser) {
      throw new ConflictException('National ID already registered');
    }

    // Update user with profile data
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        nationalId,
        status: UserStatus.PENDING_ADMIN_APPROVAL,
        isActive: false,
        isProfileComplete: true,
        registrationStep: 3,
      },
    });

    // Create role-specific profile
    if (user.role === UserRole.PATIENT) {
      await this.prisma.patient.create({
        data: {
          userId: user.id,
        },
      });
    } else if (user.role === UserRole.DOCTOR) {
      // For doctors, we'll need specialization later
      // For now, create basic doctor profile
      await this.prisma.doctor.create({
        data: {
          userId: user.id,
          specializationId: 'temp-specialization-id', // Will be updated later
          licenseNumber: medicalCardNumber,
        },
      });
    }

    return {
      data: {
        message: 'Profile completed successfully.',
        userId: updatedUser.id,
        status: 'ACTIVE',
      },
    };
  }
}
