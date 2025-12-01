import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Query, Put } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { ApiResponse } from '@nestjs/swagger';
import { GetMessagesDto, SendMessageDto } from './dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService
       ,private readonly messageService:MessageService, 
  ) {}

  @Get()
  @Roles(UserRole.DOCTOR,UserRole.PATIENT)
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  
  async getConversations(@CurrentUser() user: JwtPayload) {
    return this.chatService.getUserChats(user.sub, user.role);
  }

   @Post('connection/:connectionId')
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  async getOrCreateChat(
    @Param('connectionId') connectionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const chat = await this.chatService.getOrCreateChat(connectionId);

    const hasAccess = await this.chatService.verifyUserAccess(chat.chatId, userId);

    if (!hasAccess) {
      throw new BadRequestException('You do not have access to this chat');
    }

    return chat;
  }

   @Get(':chatId')
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  async getChatDetails(
    @Param('chatId') chatId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.chatService.getChatDetails(chatId, userId);
  }

  @Get(':chatId/messages')
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  async getMessages(
    @Param('chatId') chatId: string,
    @Query() query: GetMessagesDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.messageService.getMessages(chatId, userId, query);
  }

   @Post('messages')
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  async sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser('sub') userId: string,
  ) {
    const message = await this.messageService.sendMessage(
      dto.chatId,
      userId,
      dto.content,
      dto.messageType || 'TEXT',
    );
     // Update chat (lastMessage + timestamp)
    const chat = await this.chatService.getChatDetails(dto.chatId, userId);
    await this.chatService.updateConnectionLastMessage(
      chat.connectionId,
      message.createdAt,
      dto.content,
    );

    return message;
  }

   @Put('messages/:messageId/read')
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  async markMessageAsRead(
    @Param('messageId') messageId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.messageService.markAsRead(messageId, userId);
  }







}
