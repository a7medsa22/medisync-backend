import { IsEmail, IsString, IsOptional, IsEnum, MinLength, MaxLength, Matches, IsPhoneNumber, IsNotEmpty, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PasswordMatch } from 'src/common/validators/password-match.validator';
import { IsEgyptianPhoneNumber } from 'src/common/validators/phone-number.validator';
import { IsEgyptianNationalId } from 'src/common/validators/egyptian-national-id.validator';

export class RegisterInitDto {
  @ApiProperty({ 
    enum: UserRole, 
    example: UserRole.PATIENT,
    description: 'User role selection'
  })
  @IsEnum(UserRole, { message: 'Role must be either PATIENT, DOCTOR, or ADMIN' })
  role: UserRole;
}

export class RegisterBasicDto {
  @ApiProperty({ example: 'uuid-from-init-step' })
  @IsUUID(4, { message: 'Invalid temporary user ID format' })
  @IsNotEmpty()
  tempUserId: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  password: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsNotEmpty()
  @PasswordMatch('password', { message: 'Password confirmation must match password' })
  confirmPassword: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Matches(/^[a-zA-ZÀ-ÿ\u0600-\u06FF\s]+$/, { message: 'First name can only contain letters and spaces' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString() 
  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Matches(/^[a-zA-ZÀ-ÿ\u0600-\u06FF\s]+$/, { message: 'Last name can only contain letters and spaces' })
  lastName: string;
}
export class RegisterVerifyEmailDto {
  @ApiProperty({ example: 'uuid-from-basic-step' })
  @IsUUID()
  userId: string;

  @ApiProperty({ 
    example: '1234',
    description: '4-digit verification code sent to email'
  })
  @IsString()
  @Length(4, 4, { message: 'OTP must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'OTP must contain only numbers' })
  otp: string;
}

export class CompleteProfileDto {
  @ApiProperty({ 
    example: '+201234567890',
    description: 'Egyptian phone number (mobile or landline)'
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number' })
  @IsEgyptianPhoneNumber({ message: 'Please provide a valid Egyptian phone number' })
  phone: string;

  @ApiProperty({ 
    example: '29001011234567',
    description: '14-digit Egyptian National ID'
  })
  @IsString()
  @IsEgyptianNationalId({ message: 'Please provide a valid Egyptian National ID' })
  nationalId: string;

  // Doctor-specific field
  @ApiProperty({ 
    example: 'DOC-56789', 
    required: false,
    description: 'Required for doctors only'
  })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Medical card number must be at least 5 characters long' })
  @MaxLength(20, { message: 'Medical card number must not exceed 20 characters' })
  medicalCardNumber?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  @IsNotEmpty()
  password: string;
}

// class ChangePasswordDto
export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword123!' })
  @IsString()
  @MinLength(1, { message: 'Current password is required' })
  @IsNotEmpty()
  oldPassword: string;



  @ApiProperty({ example: 'NewSecurePass456!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  @IsNotEmpty()
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
  @ApiProperty({ example: '1259' })
  @IsString()
  @MinLength(4, { message: 'OTP must be at least 4 digits' })
  @MaxLength(4, { message: 'OTP must be at most 4 digits' })
  @Matches(/^\d{4}$/, { message: 'OTP must contain only numbers' })
  otp: string;

  @ApiProperty({ example: '123456789012345678901234' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString()
  userId: string;
}

// class LoginDto

export class ResendOtpDto {
  @ApiProperty({ example: '123456789012345678901234' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'EMAIL_VERIFICATION' })
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(['EMAIL_VERIFICATION', 'PASSWORD_RESET'], { message: 'Type must be either EMAIL_VERIFICATION or PASSWORD_RESET' })
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
}