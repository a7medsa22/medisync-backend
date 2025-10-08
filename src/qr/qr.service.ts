import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GenerateQrDto, QrTokenType, ScanQrAndValidateDto } from './dto/generate-qr.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QrConnectionResponseDto, QrTokenResponseDto } from './dto/qr-response.dto';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto'

@Injectable()
export class QrService {

    constructor(private readonly prisma: PrismaService,
      private readonly config:ConfigService,
    ) {}

 async generateConnectionQr(doctorId:string,dto: GenerateQrDto): Promise<QrTokenResponseDto> {
   const doctor = await this.prisma.doctor.findUnique({
    where:{id:doctorId},
    include:{
        ...this.userInclude,
        specialization: true,
    }
   });
    if(!doctor){
      throw new NotFoundException('Doctor not found');
    }
   if(doctor.user.status !== 'ACTIVE'){
      throw new BadRequestException('Doctor is not active');
    }

    // 2. Generate unique token
    const token = this.generateToken(doctorId);

     const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (dto.expiryMinutes || 5));

    const qrToken= await this.prisma.qrToken.create({
      data:{
        doctorId,
        token,
        type:dto.type || QrTokenType.CONNECTION,
        expiresAt,
        metadata:dto.metadata || {}
      }
    });

        // . Generate QR Code image
    const qrCodeImage  = await this.generateQrCodeImage(token);
      
    //Calculate remaining minutes
      const remainingMinutes = Math.floor(
      (qrToken.expiresAt.getTime() - Date.now()) / 60000,
    );

 return {
      id: qrToken.id,
      token: qrToken.token,
      qrCodeImage,
      type: qrToken.type as QrTokenType,
      createdAt: qrToken.createdAt,
      expiresAt: qrToken.expiresAt,
      remainingMinutes: Math.max(0, remainingMinutes),
      isUsed: qrToken.isUsed,
      doctor: {
        id: doctor.id,
        name: `${doctor.user.firstName} ${doctor.user.lastName}`,
        specialty: doctor.specialization?.name || 'General',
      },
    };
  }

  /**
   * Patient scans QR and creates instant connection
   */
  async scanAndConnect(patientId: string,scanDto: ScanQrAndValidateDto): Promise<QrConnectionResponseDto> { 
       const qrToken = await this.validateToken(scanDto.token);

  
  }

 /**
   * Validate QR token (check expiry, usage, etc)
   */
  async validateToken(token: string) {
    // 1. Parse and verify token format
    if (!this.verifyTokenFormat(token)) {
      throw new BadRequestException('Invalid QR token format');
    }

    // 2. Find token in database
    const qrToken = await this.prisma.qrToken.findUnique({
      where: { token },
    });

    if (!qrToken) {
      throw new NotFoundException();
    }

    // 3. Check if already used
    if (qrToken.isUsed) {
      throw new BadRequestException('QR Code has already been used');
    }

    // 4. Check if expired
    if (new Date() > qrToken.expiresAt) {
      throw new BadRequestException('QR Code has expired');
    }

    // 5. Verify signature
    if (!this.verifyTokenSignature(token, qrToken.doctorId)) {
      throw new UnauthorizedException();
    }

    return qrToken;
  }


   private readonly patientInclude = {
    patient: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
        },
        },
      },
    },
  };

  private readonly doctorInclude = {
    doctor: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        specialization: true,
      },
    },
  };
  private readonly userInclude = {
    user: {
      select: {
        id:true,
        firstName: true,
        lastName: true,
        status: true,
      },
    },
  };
   

    // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Generate unique token with signature
   * Format: MDS_doctorId_randomString
   */
  private generateToken(doctorId: string): string {
    const randomPart = nanoid(32); // Generate 32 char random string
    const baseToken = `${this.config.get('QR_TOKEN_PREFIX')}_${doctorId}_${randomPart}`;
    return baseToken;
  }

  /**
   * Verify token format
   */
  private verifyTokenFormat(token: string): boolean {
    const regex = new RegExp(`^${this.config.get('QR_TOKEN_PREFIX')}[a-f0-9-]{36}_[a-zA-Z0-9_-]{32}$`);

    return regex.test(token);
  }

  /**
   * Verify token signature (optional extra security)
   */
  private verifyTokenSignature(token: string, doctorId: string): boolean {
    // Extract doctor ID from token
    const parts = token.split('_');
    if (parts.length !== 3) return false;

    const tokenDoctorId = parts[1];
    return tokenDoctorId === doctorId;
  }

  /**
   * Generate QR Code as Base64 image
   */
  private async generateQrCodeImage(token: string): Promise<string> {
     
    try {
      // Generate QR with high error correction
      const qrImage = await QRCode.toDataURL(token, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrImage;
    } catch (error) {
      throw new BadRequestException('فشل في توليد QR Code image');
    }
  }

  /**
   * Generate HMAC signature for extra security (optional)
   */
  private generateSignature(data: string): string {
    const TOKEN_SECRET = this.config.get('QR_TOKEN_PREFIX')
    return crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(data)
      .digest('hex')
      .substring(0, 16);
  }
}
