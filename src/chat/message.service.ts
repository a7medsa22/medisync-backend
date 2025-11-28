import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { chatDetailsSelect, connectionSelect } from 'src/common/selects/chat.select';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatService } from './chat.service';

@Injectable()
export class MessageService {
    constructor(private readonly prisma:PrismaService,private readonly chatService:ChatService){}
     async sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    messageType: string = 'TEXT',
  ) {
    // Verify chat exists
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      select:{
        ...chatDetailsSelect,
        connection: {select:{status:true}}
      },

      
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Verify sender has access
   if (!this.chatService.hasAccess(chat, senderId)) {
               throw new ForbiddenException('No access');
           }
    // Verify connection is ACTIVE
    if (chat.connection.status !== 'ACTIVE') {
      throw new BadRequestException('Connection is not active');
    }
  const sender = await this.prisma.user.findUnique({
  where: { id: senderId },
  select: {
    id: true,
    firstName: true,
    lastName: true,
    role: true,
  },
});
 if(!sender){
    
 }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
        messageType,
        senderName:`${sender?.firstName} ${sender?.lastName}`,
        senderRole:sender?.role,
        
        
      },
    });

    return message;
  }


}
