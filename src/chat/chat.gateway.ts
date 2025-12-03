import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from 'src/notifications/notifications.service';
@WebSocketGateway({
   cors: { origin: '*', credentials: true },
  namespace: '/chat',
})

@Injectable()
export class ChatGateway implements OnGatewayInit,OnGatewayConnection,OnGatewayDisconnect {
    @WebSocketServer()server:Server;

    // userId -> Set<socketId>
 private activeUsera = new Map<string,string>();
   // userId -> Set<socketId> (typing)
 private typingUsers = new Map<string,Set<string>>();

 constructor(
  private readonly chatService:ChatService,
  private readonly messageService:MessageService,
  private readonly config:ConfigService,
  private readonly jwtService:JwtService,
  @Inject(forwardRef(() => NotificationsService))
  private  notificationsService:NotificationsService,

 ){}
  afterInit() {
    console.log('Chat Gateway Initialized');
  }
  


}
