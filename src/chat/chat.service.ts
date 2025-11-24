import { Injectable, NotFoundException } from '@nestjs/common';
import { ConnectionStatus, PrismaClient } from '@prisma/client';
import { doctorInclude, patientInclude } from 'src/common/utils/include.utils';


@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaClient) {}

    async getOrCreateChat (connectionId:string){
        const connection = await this.prisma.doctorPatientConnection.findUnique({
            where:{id:connectionId},
            select:{
                id:true,
                status:true,
                doctor:doctorInclude.doctor,
               patient:patientInclude.patient,
            }  });

             if (!connection) throw new NotFoundException('Connection not found');
             if(connection.status !== ConnectionStatus.ACTIVE) throw new NotFoundException('Connection is not active');

             let chat = await this.prisma.chat.findUnique({
                where:{connectionId:connection.id},
                select:{
                    id:true,
                    connectionId:true,
                }
             })
             
             if(!chat){
                chat = await this.prisma.$transaction(async (prisma)=>{
                    const newChat = await prisma.chat.create({
                        data:{connectionId}
                    });

                    await prisma.massage.create({
                    data:{
                        chatId:newChat.id,
                        senderId:connection.doctor.id,
                        content: 'Chat started. You can now communicate securely.',
                       massageType:'SYSTEM',
                       isRead:true,
                    }
                    });
                    return newChat;
                  }); 
                }

              return {
                   chatId: chat.id,
                   connectionId: connection.id,
                   doctor: {
                     id: connection.doctor.userId,
                     name: connection.doctor.user.firstName + ' ' + connection.doctor.user.lastName,
                   },
                   patient: {
                     id: connection.patient.userId,
                     name: connection.patient.user.firstName + ' ' + connection.patient.user.lastName,
                   },
                 };   
            }
    }

