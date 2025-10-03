import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ParseBoolPipe } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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

  @Get('my-prescriptions')
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: 'Get My Prescriptions (Patient)',
    description: 'Patient gets all their prescriptions from all doctors',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescriptions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              medications: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Panadol' },
                    dosage: { type: 'string', example: '500mg' },
                    frequency: { type: 'number', example: 3 },
                    frequencyType: { type: 'string', example: 'daily' },
                    duration: { type: 'string', example: '7 days' },
                    notes: { type: 'string', example: 'After meals' },
                  },
                },
              },
              notes: { type: 'string' },
              isActive: { type: 'boolean' },
              prescribedAt: { type: 'string' },
              doctor: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                    },
                  },
                  specialization: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getMyPrescriptions(
    @CurrentUser('profile') patientProfile: any,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
  ) {
    return this.prescriptionsService.getMyPrescriptions(patientProfile.id, isActive);
  }

   @Get('patients/:patientId')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get Patient Prescriptions (Doctor)',
    description: 'Doctor gets all prescriptions for a specific patient',
  })
  @ApiResponse({ status: 200, description: 'Prescriptions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No connection with this patient' })
  async getPatientPrescriptions(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser('profile') doctorProfile: any,
  ) {
    return this.prescriptionsService.getPatientPrescriptions(
      doctorProfile.id,
      patientId,
    );
  }






}
