import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { QrService } from './qr.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiAuth } from 'src/common/decorators/api-auth.decorator';
import { GenerateQrDto, ScanQrAndValidateDto } from './dto/generate-qr.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { QrTokenResponseDto } from './dto/qr-response.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('QR Code')
@Controller('qr')
@ApiAuth()
export class QrController {
  constructor(private readonly qrService: QrService) {}
    
  @Post('generate')
  @Roles(UserRole.DOCTOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Generate a connection QR code',
    description: 'Generate a QR code for a patient to connect with a doctor',
   })
   @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The QR code was successfully generated',
    type: QrTokenResponseDto,
   })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only doctors can generate QR codes' })
  @ApiResponse({ status: 400, description: 'Doctor account is not active' })
 async generateQr(@CurrentUser('profile') doctorProfile: any, @Body() body: GenerateQrDto): Promise<QrTokenResponseDto> {
    const doctorId = doctorProfile.id;
    return this.qrService.generateConnectionQr (doctorId,  body );
  }

  @Post('scan')
  @Roles(UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Scan a connection QR code',
    description: 'Scan a QR code to connect with a doctor',
   })
   @ApiResponse({
    status: HttpStatus.OK,
    description: 'The QR code was successfully scanned',
    type: QrTokenResponseDto,
   })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only patients can scan QR codes' })
  @ApiResponse({ status: 400, description: 'Patient account is not active' })
 async scanQr(@CurrentUser('profile') patientProfile: any, @Body() body: ScanQrAndValidateDto) {
    const patientId = patientProfile.id;
    return this.qrService.scanAndConnect (patientId,  body );
  }

  


}
