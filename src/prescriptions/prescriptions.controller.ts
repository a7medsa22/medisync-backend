import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiAuth } from 'src/common/decorators/api-auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Prescriptions')
@ApiAuth()
@Controller('prescriptions')
export class PrescriptionsController {
 constructor(private readonly prescriptionsService: PrescriptionsService){}

  // ===============================================
  // CREATE PRESCRIPTION (Doctor only)
  // ===============================================

  @Post('connections/:connectionId')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Create Prescription (Doctor)',
    description: 'Doctor creates a new prescription for a connected patient',
  })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  @ApiResponse({ status: 403, description: 'Not your patient' })
  @ApiResponse({ status: 400, description: 'Connection not active or invalid data' })
  async createPrescription(
    @Param('connectionId', ParseUUIDPipe) connectionId: string,
    @CurrentUser('profile') doctorProfile: any,
    @Body() body: CreatePrescriptionDto,
  ) {
    return this.prescriptionsService.createPrescription(
      doctorProfile.id,
      connectionId,
      body,
    );
  }

  // ===============================================
  // GET PRESCRIPTIONS
  // ===============================================

  @Get('connections/:connectionId')
  @ApiOperation({
    summary: 'Get Connection Prescriptions',
    description: 'Get all prescriptions for a specific doctor-patient connection',
  })
  @ApiResponse({ status: 200, description: 'Prescriptions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getConnectionPrescriptions(
    @Param('connectionId', ParseUUIDPipe) connectionId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: 'DOCTOR' | 'PATIENT',
  ) {
    return this.prescriptionsService.getConnectionPrescriptions(
      connectionId,
      userId,
      userRole,
    );
  }
  


}
