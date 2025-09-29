import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service'; // Add this import
import { ApiAuth } from '../common/decorators/api-auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator'; // Add this import
import { CompleteProfileDto } from 'src/auth/dto/auth.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserQueryDto } from './dto/user-query.dto';

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
  @ApiOperation({ 
    summary: 'Get Current User Profile',
    description: 'Get complete profile information for the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            nationalId: { type: 'string' },
            role: { type: 'string', enum: ['PATIENT', 'DOCTOR', 'ADMIN'] },
            status: { type: 'string', enum: ['INIT', 'PENDING_EMAIL_VERIFICATION', 'EMAIL_VERIFIED', 'ACTIVE', 'INACTIVE', 'SUSPENDED'] },
            isProfileComplete: { type: 'boolean' },
            profile: { type: 'object', description: 'Role-specific profile (Patient or Doctor)' }
          }
        }
      }
    }
  })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @ApiAuth()
  @ApiOperation({ 
    summary: 'Update Current User Profile',
    description: 'Update profile information for the authenticated user'
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, body);
  }

  @Get('registration-status')
  @Public()
  @ApiOperation({
    summary: 'Get User Registration Status',
    description: 'Check the registration progress for a specific user'
  })
  @ApiQuery({ name: 'userId', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Registration status retrieved',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            nextStep: { type: 'string', example: 'Complete profile information (Step 4)' },
            isComplete: { type: 'boolean', example: false }
          }
        }
      }
    }
  })
  getUserRegistrationStatus(@Query('userId', ParseUUIDPipe) userId: string) {
    return this.usersService.getUserRegistrationStatus(userId);
  }

    // ===============================================
  // ADMIN ENDPOINTS (User Management)
  // ===============================================

@Get()
  @ApiAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get All Users (Admin only)',
    description: 'Retrieve all users with filtering and pagination options'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            users: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                pages: { type: 'number' }
              }
            }
          }
        }
      }
    }
  })
  getAllUsers( @Query() query:UserQueryDto,) {
    return this.usersService.getAllUsers(query);
  }

  @Get('stats')
  @ApiAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get User Statistics (Admin only)',
    description: 'Get comprehensive statistics about users in the system'
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number', example: 150 },
            activeUsers: { type: 'number', example: 120 },
            registrationFlow: {
              type: 'object',
              properties: {
                init: { type: 'number' },
                pendingEmail: { type: 'number' },
                emailVerified: { type: 'number' },
                completed: { type: 'number' }
              }
            },
            byRole: {
              type: 'object',
              properties: {
                patients: { type: 'number' },
                doctors: { type: 'number' },
                admins: { type: 'number' }
              }
            }
          }
        }
      }
    }
  })
  async getUserStats() {
    return this.usersService.getUserStats();
  }

   @Get(':id')
  @ApiAuth()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get User by ID (Admin/Doctor)',
    description: 'Get detailed information about a specific user'
  })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id/activate')
  @ApiAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Activate User (Admin only)',
    description: 'Activate a user account that was previously deactivated'
  })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  activateUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.usersService.activateUser(userId);
  }

  @Put(':id/deactivate')
  @ApiAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Deactivate User (Admin only)',
    description: 'Deactivate a user account (cannot deactivate your own account)'
  })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 403, description: 'Cannot deactivate own account' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deactivateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.usersService.deactivateUser(userId, currentUserId);
  }
}

  
