import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { GenerateQrDto } from './dto/generate-qr.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QrTokenResponseDto } from './dto/qr-response.dto';

@Injectable()
export class QrService {

    constructor(private readonly prisma: PrismaService) {}

 async generateConnectionQr(doctorId:string,dto: GenerateQrDto): Promise<QrTokenResponseDto> {
   const doctor = await this.prisma.doctor.findUnique({
    where:{id:doctorId},
    include:{
        ...this.userInclude,
    }
   });
    if(!doctor){
      throw new NotFoundException('Doctor not found');
    }
   if(doctor.user.status !== 'ACTIVE'){
      throw new BadRequestException('Doctor is not active');
    }
    
    return {}


  }

   private readonly patientInclude = {
    patient: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
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
  const userInclude = {
    user: {
      select: {
        id:true,
        firstName: true,
        lastName: true,
        status: true,
      },
    },
  };
}
