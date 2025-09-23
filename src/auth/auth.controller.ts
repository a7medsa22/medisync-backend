import { Controller, Get, Post, Body, Request, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RefreshTokenDto, RegisterDto, ResendOtpDto, ResetPasswordDto, VerifyOtpDto } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
    
  // ===============================================
  // REGISTRATION WITH EMAIL VERIFICATION
  // ===============================================
    @Post('register')
    @Throttle({ auth: { limit: 3, ttl: 60000 } }) 
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new user', 
    description: 'Register a new user account. An email verification code will be sent to the provided email address.' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully, verification code sent to email',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Registration successful. Please check your email for verification code.' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'uuid-string' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email or National ID already exists',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'array', items: { type: 'string' }, example: ['Email already registered'] }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
    async register(@Body() body: RegisterDto) {
      return this.authService.register(body);
    }

    @Post('verify-registration')
    @Throttle({ auth: { limit: 5, ttl: 60000 } }) 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify registration email with OTP',
    description: 'Verify the email address using the 4-digit code sent during registration'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Email verified successfully. Your account is pending admin approval.' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired verification code',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'array', items: { type: 'string' }, example: ['Invalid or expired verification code'] }
      }
    }
  })
    async verifyRegistration(@Body() body: VerifyOtpDto) {
      return this.authService.verifyRegistrationOtp(body);
    }

  // ===============================================
  // LOGIN WITH OTP VERIFICATION
  // ===============================================

   @Post('login')
  @Throttle({ auth: { limit: 5, ttl: 60000 } }) 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login (Step 1)',
    description: 'Authenticate user credentials and send OTP to email for verification'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Credentials verified, OTP sent to email',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Please check your email for verification code to complete login.' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'uuid-string' },
            requiresOtp: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials or account not approved',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'array', items: { type: 'string' }, example: ['Invalid credentials'] }
      }
    }
  })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('verify-login')
  @Throttle({ auth: { limit: 5, ttl: 60000 } }) 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify login OTP (Step 2)',
    description: 'Complete login process by verifying the OTP sent to email'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful, tokens provided',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: { type: 'string', enum: ['PATIENT', 'DOCTOR', 'ADMIN'] },
                status: { type: 'string', enum: ['APPROVED'] }
              }
            },
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            expiresIn: { type: 'string', example: '15m' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired verification code' 
  })
  async verifyLogin(@Body() body: VerifyOtpDto) {
    return this.authService.verifyLoginOtp(body);
  }

  
  // ===============================================
  // FORGOT PASSWORD WITH OTP
  // ===============================================

  @Post('forgot-password')
  @Throttle({ auth: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send password reset OTP to user email if account exists'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reset code sent to email if account exists',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Password reset code sent to your email.' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'uuid-string' }
          }
        }
      }
    }
  })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Post('verify-reset-otp')
  @Throttle({ auth: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify password reset OTP',
    description: 'Verify the OTP sent for password reset and get reset token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reset code verified, reset token provided',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Reset code verified. You can now set a new password.' },
        data: {
          type: 'object',
          properties: {
            resetToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired reset code' 
  })
  async verifyResetOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyResetPasswordOtp(verifyOtpDto);
  }

  @Post('reset-password')
  @Throttle({ auth: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset password with verified token',
    description: 'Set new password using the reset token obtained from OTP verification'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Password reset successfully. You can now login with your new password.' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired reset token' 
  })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  // ===============================================
  // RESEND OTP
  // ===============================================

  @Post('resend-otp')
  @Throttle({ auth: { limit: 3, ttl: 120000 } }) // 3 resend attempts per 2 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Resend OTP code',
    description: 'Resend verification code for email verification, login, or password reset'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'New verification code sent',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'New verification code sent to your email.' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Rate limit exceeded or user not found' 
  })
  async resendOtp(@Body() body:ResendOtpDto) {
    return this.authService.resendOtp(body.userId, body.type);
  }

  // ===============================================
  // TOKEN MANAGEMENT
  // ===============================================

  @Post('refresh')
  @Throttle({ auth: { limit: 10, ttl: 60000 } }) // 10 refresh attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Get new access token using valid refresh token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid refresh token' 
  })
  async refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User logout',
    description: 'Logout current user (invalidates session on client side)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logged out successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Logged out successfully' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token' 
  })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }


  // ===============================================
  // ACCOUNT MANAGEMENT
  // ===============================================

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Change user password',
    description: 'Change current user password (requires current password verification)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Password changed successfully' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid current password' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token' 
  })
  async changePassword(
    @Request() req,
    @Body() body: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.id,
      body.oldPassword,
      body.newPassword,
    );
  }

}
