import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MessageService } from './message.service';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { forwardRef } from '@nestjs/common';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AuthModule } from 'src/auth/auth.module';
import { RedisService } from 'src/common/cache/redis.service';
import { ChatEventsService } from './chat-events.service';
import { WsJwtGuard } from 'src/auth/guards/ws-Jwt.guard';
import { ActiveUsersService } from './active-users.service';
import { UserCacheService } from 'src/common/cache/user-cache.service';

@Module({
  imports: [PrismaModule, forwardRef(() => NotificationsModule), AuthModule],
  controllers: [ChatController],
  providers: [ChatService, MessageService, ChatGateway, RedisService, ActiveUsersService, ChatEventsService, WsJwtGuard,UserCacheService],
  exports: [ChatService, MessageService, ChatGateway, RedisService, ActiveUsersService, ChatEventsService],
})
export class ChatModule {}
