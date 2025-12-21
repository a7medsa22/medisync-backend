import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma, UserRole, UserStatus } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserQueryDto } from './dto/user-query.dto';
export type UserWithoutPassword = Omit<User, 'password'>;


@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  // --- Common Helpers 
  private baseUserSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    nationalId: true,
    role: true,
    status: true,
    isActive: true,
    isProfileComplete: true,
    registrationStep: true,
    createdAt: true,
    updatedAt: true,
  };

    private async getUserOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  
    private userRelations() {
    return {
      patient: true,
      doctor: { include: { specialization: true } },
    };
  }
 
  //state pattern for registration steps
  private getNextRegistrationStep(status: UserStatus) {
    switch (status) {
      case UserStatus.INIT:
        return 'Step 2: Complete basic information';
      case UserStatus.PENDING_EMAIL_VERIFICATION:
        return 'Step 3: Verify email address';
      case UserStatus.EMAIL_VERIFIED:
        return 'Step 4: Complete profile';
      case UserStatus.ACTIVE:
        return 'Completed';
      default:
        return 'Contact support';
    }
  }


  // ---------logics
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: this.userRelations(),
    });
  }
   async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: this.userRelations(),
    });
  }
  
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: this.userRelations(),
    });
    if (!user) throw new NotFoundException('User not found');

    return {
      ...user,
      profile: user.role === UserRole.PATIENT ? user.patient : user.doctor,
      patient: undefined,
      doctor: undefined,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.getUserOrThrow(userId);

    const { firstName, lastName, phone, ...profileData } = dto;

    await this.prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, phone },
    });

    if (user.role === UserRole.PATIENT) {
      await this.prisma.patient.update({
        where: { userId },
        data: { ...profileData },
      });
    } else if (user.role === UserRole.DOCTOR) {
      await this.prisma.doctor.update({
        where: { userId },
        data: { ...profileData },
      });
    }

    return this.getProfile(userId);
  }
  
  
   async getUserStats() {
    const [total, active, complete, patients, doctors, admins] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
        this.prisma.user.count({ where: { isProfileComplete: true } }),
        this.prisma.user.count({ where: { role: UserRole.PATIENT } }),
        this.prisma.user.count({ where: { role: UserRole.DOCTOR } }),
        this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      ]);

    return {
      total,
      active,
      complete,
      byRole: { patients, doctors, admins },
    };
  }

  // ---------- Registration Step
  async getUserRegistrationStatus(userId: string) {
    const user = await this.getUserOrThrow(userId);

    const nextStep = this.getNextRegistrationStep(user.status);

    return {
      user,
      nextStep,
      isComplete: user.status === UserStatus.ACTIVE && user.isProfileComplete,
    };
  }

 // ---------- Admin Management
    
    async getAllUsers(query:UserQueryDto) {
    const { page = 1, limit = 10, role, status,search } = query;
    const skip = (page - 1) * limit;
    const where: any = { ...(role && { role }), ...(status && { status }), ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search, mode: 'insensitive' } },
      ],
    }),
   };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: this.baseUserSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async deactivateUser(userId: string, currentUserId: string) {
    if (userId === currentUserId) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }
    await this.getUserOrThrow(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false, status: UserStatus.INACTIVE },
    });
  }

  async activateUser(userId: string) {
    const user = await this.getUserOrThrow(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        status: user.isProfileComplete? UserStatus.ACTIVE : UserStatus.EMAIL_VERIFIED,
      },
    });
  }

  
}
