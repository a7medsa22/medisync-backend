import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService
       ,private readonly messageService:MessageService, 
  ) {}

  @Get()
  @RolesGuard()
  async getConversations(@CurrentUser() user: JwtPayload) {
    return this.chatService.getUserChats(user.sub, user.role);
  }

}
