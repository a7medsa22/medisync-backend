import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsNumber, IsObject, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UserProfileResponseDto {
  @ApiProperty({ example: 'uuid-from-init-step', description: 'User ID' })
  @IsString() 
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  nationalId?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  isProfileComplete: boolean;

  @ApiProperty({ example: 2 })
  @IsNumber()
  registrationStep: number;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDateString()
  updatedAt: Date;

  @ApiProperty({ 
    description: 'Patient profile (only for patients)',
    required: false 
  })
  profile?: {
    id: string;
    dateOfBirth?: Date;
    gender?: string;
    address?: string;
    emergencyContact?: string;
    bloodType?: string;
    allergies?: string;
  } | {
    id: string;
    specializationId: string;
    licenseNumber?: string;
    experience?: number;
    bio?: string;
    consultationFee?: number;
    workingDays?: string[];
    workingHours?: { start: string; end: string };
    specialization: {
      id: string;
      name: string;
      nameAr?: string;
    };
  };
}

// UpdateProfileDto
export class UpdateProfileDto {
  // Base user information
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+201234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  // Patient-specific fields
  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: 'Male', required: false })
  @IsOptional()
  @IsEnum(['Male', 'Female'], { message: 'Gender must be either Male or Female' })
  gender?: string;

  @ApiProperty({ example: '123 Main Street, Cairo, Egypt', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '+201987654321', required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ example: 'O+', required: false })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiProperty({ example: 'Penicillin, Peanuts', required: false })
  @IsOptional()
  @IsString()
  allergies?: string;

  // Doctor-specific fields
  @ApiProperty({ example: 'Experienced cardiologist with 10+ years of practice.', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsNumber()
  experience?: number;

  @ApiProperty({ example: 500.00, required: false })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  consultationFee?: number;

  @ApiProperty({ example: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'], required: false })
  @IsOptional()
  @IsArray()
  workingDays?: string[];

  @ApiProperty({ 
    example: { start: '09:00', end: '17:00' }, 
    required: false 
  })
  @IsOptional()
  @IsObject()
  workingHours?: { start: string; end: string };
}

export class UserStatsResponseDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty({
    type: 'object',
    properties: {
      init: { type: 'number' },
      pendingEmail: { type: 'number' },
      emailVerified: { type: 'number' },
      completed: { type: 'number' },
    },
  })
  registrationFlow: {
    init: number;
    pendingEmail: number;
    emailVerified: number;
    completed: number;
  };

  @ApiProperty({
    type: 'object',
    properties: {
      patients: { type: 'number' },
      doctors: { type: 'number' },
      admins: { type: 'number' },
    },
  })
  byRole: {
    patients: number;
    doctors: number;
    admins: number;
  };
}


export class CreateAdminUserDto {
  @ApiProperty({ example: 'admin@medisync.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'AdminPass123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  password: string;

  @ApiProperty({ example: 'System' })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @ApiProperty({ example: 'Administrator' })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @ApiProperty({ example: '+201000000000', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
