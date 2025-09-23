import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'node_modules/bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '@prisma/client';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
     constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

    public async register(dto:RegisterDto): Promise<{ message: string; userId: string }> {
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
  return {
      message: 'Registration successful. Please wait for admin approval.',
      userId: user.id,
    };
  } 

      async login(dto: LoginDto): Promise<AuthResponse> {
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

    // Generate JWT
   const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        role: user.role,
      },
    };
  }

}
