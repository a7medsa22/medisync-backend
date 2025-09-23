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

     const accessToken = await this.generateAccessToken(payload);
     const refreshToken = await this.generateRefreshToken(user.id);

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
  // validate user
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
   // Validate JWT payload
  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        patient: true,
        doctor: {
          include: {
            specialization: true,
          },
        },
      },
    });

    if (!user || user.status !== UserStatus.APPROVED || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: user.role === UserRole.PATIENT ? user.patient : user.doctor,
    };
  }

   // Refresh token
    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        try {
          const payload = await this.jwtService.verifyAsync(refreshToken, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
          });
          const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.APPROVED || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      };
      const newAccessToken = await this.generateAccessToken(newPayload);
      const newRefreshToken = await this.generateRefreshToken(user.id);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
        } catch (error) {
        throw new UnauthorizedException('Invalid refresh token');
        }
      }
     // change password
    

      // Logout function
    async logout(userId: string): Promise<{ message: string }> {
    // Here you could implement token blacklisting if needed
    // For now, we'll just return success since JWT is stateless
    return { message: 'Logged out successfully' };
  }


   private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });
  }
  

  private async generateRefreshToken(userId: string): Promise<string> {
    const payload = { sub: userId, type: 'refresh' };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
  }

}

