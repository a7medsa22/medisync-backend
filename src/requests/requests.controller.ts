import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateFollowUpRequestDto } from './dto/create-follow-up-request.dto';

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

}
