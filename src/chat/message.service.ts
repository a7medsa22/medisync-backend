import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { chatDetailsSelect, chatDetailsSelectWithStatus, connectionSelect } from 'src/common/selects/chat.select';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatService } from './chat.service';
import { UserCacheService } from 'src/common/cache/user-cache.service';
import { GetMessagesDto } from './dto';
import { messageSelect } from 'src/common/selects/message.select';

@Injectable()
export class MessageService {
    constructor(private readonly prisma: PrismaService, private readonly chatService: ChatService,
        private readonly userCacheService: UserCacheService
    ) { }
    async sendMessage(
        chatId: string,
        senderId: string,
        content: string,
        messageType: string = 'TEXT',
    ) {

        // 1. Validate content
        if (!content || !content.trim()) {
            throw new BadRequestException('Message cannot be empty');
        }
        // Verify chat exists
        const chat = await this.prisma.chat.findUnique({
            where: { id: chatId },
            select: chatDetailsSelectWithStatus

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
        const sender = await this.userCacheService.getUserSnapshot(senderId);
        if (!sender) {
            throw new NotFoundException('Sender not found');
        }

        // Create message
        const message = await this.prisma.message.create({
            data: {
                chatId,
                senderId,
                content,
                messageType,
                senderName: `${sender.firstName} ${sender.lastName}`,
                senderRole: sender.role,
            },
        });

        return message;
    }

     async getMessages(chatId: string, userId: string, query: GetMessagesDto) {
    // Verify access
    const chat =await this.chatService.getChatHeader(chatId);

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!this.chatService.hasAccess(chat, userId)) {
      throw new ForbiddenException('No access to this chat');
    }

    // Pagination logic
   
    const limit = query.limit ?? 20;

    // Build where clause
    const where: any = {
      chatId,
      isDeleted: false,
    };

    if (query.before) {
  const beforeMessage = await this.prisma.message.findUnique({
    where: { id: query.before },
    select: { createdAt: true },
  });

  if (beforeMessage) {
    where.createdAt = { lt: beforeMessage.createdAt };
  }
}

    // Get messages
    const messages = await this.prisma.message.findMany({
      where,
     select:messageSelect,
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

  // 5) Determine if hasMore
      const lastMessage = messages.at(-1);

    const hasMore =
     lastMessage ? await this.prisma.message.count({
        where: {
          chatId,
          isDeleted: false,
          createdAt: { lt: lastMessage.createdAt },
        },
      }) > 0 :  false;


   
    return {
      messages,
     cursor: lastMessage?.createdAt || null,
       hasMore,
     
    };
  }

  





}
