import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateFollowUpRequestDto } from './dto/create-follow-up-request.dto';
import { RequestQueryDto } from './dto/request.query.dto';

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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
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
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'ACCEPTED', 'REJECTED'] })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Requests retrieved successfully' })
  async getAllRequests(
    @CurrentUser('profile') doctorProfile: any,
    @Query() query: RequestQueryDto,
  ) {
    return this.requestsService.getAllRequests(doctorProfile.id, query);
  }
  


}
