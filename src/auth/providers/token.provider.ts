import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class TokenProvider {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
   return this.jwtService.signAsync(
    { sub: userId, type: 'refresh' },
    {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    },
  );
  }

  
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.status !== UserStatus.ACTIVE || !user.isProfileComplete) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload: JwtPayload = { sub: user.id, email: user.email, role: user.role, status: user.status };
      return {
        accessToken: await this.generateAccessToken(newPayload),
        refreshToken: await this.generateRefreshToken(user.id),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  
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

  if (!user || user.status !== UserStatus.ACTIVE || !user.isProfileComplete) {
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

  
}
