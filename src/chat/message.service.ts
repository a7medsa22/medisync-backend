import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { chatDetailsSelect, chatDetailsSelectWithStatus, connectionSelect } from 'src/common/selects/chat.select';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatService } from './chat.service';
import { UserCacheService } from 'src/common/cache/user-cache.service';

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

        



}
