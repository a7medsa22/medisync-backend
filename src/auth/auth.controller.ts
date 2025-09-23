import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto, VerifyOtpDto } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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

  


}
