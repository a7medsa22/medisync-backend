import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateFollowUpRequestDto } from './dto/create-follow-up-request.dto';
import { RequestQueryDto } from './dto/request.query.dto';
import { RespondToRequestDto } from './dto/respond-to-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';

@ApiTags('Requests & Connections')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}
  
  @Post()
  @Roles(UserRole.PATIENT)
  @ApiOperation({ 
    summary: 'Send Follow-up Request (Patient)',
    description: 'Patient sends a follow-up request to a doctor with prescription image'
  })
  @ApiResponse({ status: 201, description: 'Request sent successfully' })
  @ApiResponse({ status: 409, description: 'Already connected or pending request exists' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async createFollowUpRequest(
    @CurrentUser('profile') patientProfile: any,
    @Body() body: CreateFollowUpRequestDto,
  ) {
    return this.requestsService.createFollowUpRequest(patientProfile.id, body);
  }

  @Get('pending')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ 
    summary: 'Get Pending Requests (Doctor)',
    description: 'Doctor gets list of pending follow-up requests'
  })
  @ApiResponse({ status: 200, description: 'Pending requests retrieved successfully' })
  async getPendingRequests(
    @CurrentUser('profile') doctorProfile: any,
    @Query() query: RequestQueryDto,
  ) {
    return this.requestsService.getPendingRequests(doctorProfile.id, query);
  }

  @Get('all')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ 
    summary: 'Get All Requests (Doctor)',
    description: 'Doctor gets all requests with optional status filter'
  }) 
  @ApiResponse({ status: 200, description: 'Requests retrieved successfully' })
  async getAllRequests(
    @CurrentUser('profile') doctorProfile: any,
    @Query() query: RequestQueryDto,
  ) {
    return this.requestsService.getAllRequests(doctorProfile.id, query);
  }

  @Post(':id/accept')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ 
    summary: 'Accept Follow-up Request (Doctor)',
    description: 'Doctor accepts a follow-up request and sets communication schedule'
  })
  @ApiResponse({ status: 200, description: 'Request accepted, connection created' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({ status: 400, description: 'Request already responded' })
  async acceptRequest(
    @Param('id', ParseUUIDPipe) requestId: string,
    @CurrentUser('profile') doctorProfile: any,
    @Body() body: RespondToRequestDto,
  ) {
    return this.requestsService.acceptRequest(requestId, doctorProfile.id, body);
  }

  @Post(':id/reject')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ 
    summary: 'Reject Follow-up Request (Doctor)',
    description: 'Doctor rejects a follow-up request with reason'
  })
  @ApiResponse({ status: 200, description: 'Request rejected' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({ status: 400, description: 'Request already responded' })
  async rejectRequest(
    @Param('id', ParseUUIDPipe) requestId: string,
    @CurrentUser('profile') doctorProfile: any,
    @Body() body: RejectRequestDto,
  ) {
    return this.requestsService.rejectRequest(requestId, doctorProfile.id, body.reason);
  }

  
  // ===============================================
  // CONNECTIONS ENDPOINTS
  // ===============================================

  @Get('connections')
  @ApiOperation({ 
    summary: 'Get My Connections',
    description: 'Get all active connections (Doctor: patients, Patient: doctors)'
  })
  @ApiResponse({ status: 200, description: 'Connections retrieved successfully' })
  async getConnections(
    @CurrentUser('role') role: UserRole,
    @CurrentUser('profile') profile: any,
    @Query() query:RequestQueryDto,
  ) {
    if (role === UserRole.DOCTOR) {
      return this.requestsService.getConnectedPatients(profile.id, query);
    } else {
      return this.requestsService.getConnectedDoctors(profile.id);
    }
  }

  @Get('connections/:id')
  @ApiOperation({ 
    summary: 'Get Connection Details',
    description: 'Get detailed information about a specific connection'
  })
  @ApiResponse({ status: 200, description: 'Connection details retrieved' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getConnection(
    @Param('id', ParseUUIDPipe) connectionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.requestsService.getConnection(connectionId, userId);
  }







}
