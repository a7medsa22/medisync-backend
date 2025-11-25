import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MessageService } from './message.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, MessageService],
})
export class ChatModule {}
