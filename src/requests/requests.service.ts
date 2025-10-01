import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFollowUpRequestDto } from './dto/create-follow-up-request.dto';
import { RequestQueryDto } from './dto/request.query.dto';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma:PrismaService){}

  async createFollowUpRequest(patientId:string,dto: CreateFollowUpRequestDto) {
     const {doctorId,prescriptionImage,notes} = dto

   const patient = await this.prisma.patient.findUnique({
    where:{id:doctorId},
    include:{user:true}
   });
    
   if(!patient){
          throw new NotFoundException('Patient not found');
   }

   const doctor = await this.prisma.doctor.findUnique({
    where:{id:doctorId},
    include:{user:true}
   });

    if (!doctor || doctor.user.status !== 'ACTIVE' || !doctor.user.isActive) {
      throw new NotFoundException('Doctor not found or inactive');
    }

      const pendingRequest = await this.prisma.followUpRequest.findFirst({
      where: {
        patientId,
        doctorId,
        status: 'PENDING',
      },
    });


    if (pendingRequest) {
      throw new ConflictException('You already have a pending request with this doctor');
    }

    const request = await this.prisma.followUpRequest.create({
      data:{
        patientId,
        doctorId,
        prescriptionImage,
        notes,
      },
      include:{
        ...this.patientInclude,
        ...this.doctorInclude,
      }
    })
    // TODO: Send notification to doctor
    // await this.notificationsService.sendNewRequestNotification(doctor.userId, request);
    return {
            message: 'Follow-up request sent successfully',
            request,
          };
  }
  async getPendingRequests(doctorId:string,dto:RequestQueryDto){
    const {page=1,limit=10} = dto;

    const skip = (page - 1) * limit;

    const [requests , total] = await Promise.all([
      this.prisma.followUpRequest.findMany({
        where: {
          doctorId,
          status: 'PENDING',
        },
        
        include: {
          ...this.patientInclude,
        },
        skip,
        take: limit,
        orderBy:{requestDate:'asc'}
      }),
      this.prisma.followUpRequest.count({where: {doctorId,status: 'PENDING'},
      }),
    ]);

   return {
      requests,
      pagination: this.buildPagination(total, page, limit),
    };
  }
    
    async getAllRequests(doctorId:string,dto:RequestQueryDto,status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'){
      const {page=1,limit=10} = dto;

      const skip = (page - 1) * limit;
      const where: any = { doctorId, ...(status && { status }) };

      const [requests , total] = await Promise.all([
        this.prisma.followUpRequest.findMany({
        where,
        skip,
        take: limit,
        include: this.patientInclude,
        orderBy: { requestDate: 'desc' },

        }),
        this.prisma.followUpRequest.count({where}),
      ]);
    
      return {
        requests,
        pagination: this.buildPagination(total, page, limit),
      };
    }






  private readonly patientInclude = {
    patient: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            nationalId: true,
          },
        },
      },
    },
  };

  private readonly doctorInclude = {
    doctor: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        specialization: true,
      },
    },
  };

  // Reusable pagination builder
  private buildPagination(total: number, page: number, limit: number) {
    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}
