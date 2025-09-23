import { IsEmail, IsString, IsOptional, IsEnum, MinLength, MaxLength, Matches, IsPhoneNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @ApiProperty({ example: '+201234567890', required: false })
  @IsOptional()
  @IsString()
  @Matches(
    /^\+?[1-9]\d{1,14}$/,
    { message: 'Please provide a valid phone number' }
  )
  phone?: string;

  @ApiProperty({ example: '12345678901234', required: false })
  @IsOptional()
  @IsString()
  @MinLength(14, { message: 'National ID must be exactly 14 digits' })
  @MaxLength(14, { message: 'National ID must be exactly 14 digits' })
  @Matches(/^\d{14}$/, { message: 'National ID must contain only numbers' })
  nationalId?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PATIENT, required: false })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either PATIENT, DOCTOR, or ADMIN' })
  role?: UserRole;
}

// class ChangePasswordDto
export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword123!' })
  @IsString()
  @MinLength(1, { message: 'Current password is required' })
  oldPassword: string;

  @ApiProperty({ example: 'NewSecurePass456!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  newPassword: string;
}
export class ForgotPasswordDto{
   @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}
export class ResetPasswordDto{
  @ApiProperty({ example: 'NewSecurePass456!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  newPassword: string;
  @ApiProperty({ example: '123456789012345678901234' })
  @IsNotEmpty({ message: 'Reset token is required' })
  @IsString()
  resetToken: string;
}

// class RefreshTokenDto
export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}
export class VerifyOtpDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6, { message: 'OTP must be at least 6 digits' })
  @MaxLength(6, { message: 'OTP must be at most 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only numbers' })
  otp: string;

  @ApiProperty({ example: '123456789012345678901234' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString()
  userId: string;
}

// class LoginDto
export class LoginDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}