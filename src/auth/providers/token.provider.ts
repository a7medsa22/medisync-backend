import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenType, User, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs'
import { throws } from 'assert';

@Injectable()
export class TokenProvider {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) { }


  async refreshTokens(userId: string, tokenId: string) {

    const token = await this.validateRefreshToken(userId, tokenId);

    if (!token) throw new UnauthorizedException('Token reuse detected');

    await this.prisma.authToken.update({
      where: { id: tokenId },
      data: {
        isRevoked: true,
      }
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if(!user) throw new UnauthorizedException('Token reuse detected');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: Number(this.configService.get('JWT_EXPIRES_IN')),
    };
  }

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const tokenId = crypto.randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: userId, tokenId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    const hash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.authToken.create({
      data: {
        id: tokenId,
        userId,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        type: TokenType.REFRESH,
      }
    });

    return refreshToken;
  }



  async validateRefreshToken(userId: string, tokenId: string) {
    const token = await this.prisma.authToken.findUnique({
      where: { id: tokenId },
    });
    if (!token || token.isRevoked || token.expiresAt < new Date()) {
      throw new UnauthorizedException('invalid refresh token')
    }

    return {
      userId,
      tokenId
    };

  };

  async validateJwtPayload(userId: string): Promise<any> {
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
