import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service'; // Add this import
import { ApiAuth } from '../common/decorators/api-auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator'; // Add this import
import { CompleteProfileDto } from 'src/auth/dto/auth.dto';
import { UpdateProfileDto } from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService, // Add this
  ) {}

  // ===============================================
  // PROFILE COMPLETION (Step 4 of Registration)
  // ===============================================

  @Patch(':id/profile')
  @Public() // Allow access during registration process
  @ApiOperation({ 
    summary: 'Step 4: Complete Profile', 
    description: 'Complete user profile with phone, national ID, and role-specific information' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Profile completed successfully.' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'uuid-string' },
            status: { type: 'string', example: 'ACTIVE' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid user ID or email not verified' })
  @ApiResponse({ status: 409, description: 'National ID already registered' })
  async completeProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CompleteProfileDto,
  ) {
    return this.authService.completeUserProfile(id, body);
  }

  // ===============================================
  // EXISTING USER METHODS
  // ===============================================

  @Get('profile')
  @ApiAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @ApiAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, body);
  }

  @Get()
  @ApiAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
  ) {
    return this.usersService.getAllUsers(page, limit, role, status);
  }

  @Put(':id/deactivate')
  @ApiAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate user (Admin only)' })
  async deactivateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.usersService.deactivateUser(userId, currentUserId);
  }

  @Put(':id/activate')
  @ApiAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate user (Admin only)' })
  async activateUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.usersService.activateUser(userId);
  }

  @Get('stats')
  @ApiAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  async getUserStats() {
    return this.usersService.getUserStats();
  }
}