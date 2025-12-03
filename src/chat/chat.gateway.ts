import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from 'src/notifications/notifications.service';
import { RedisService } from 'src/common/cache/redis.service';
import { SendMessageDto } from './dto';
@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})

@Injectable()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // userId -> Set<socketId>
  private activeUsers = new Map<string, string>();
  // userId -> Set<socketId> (typing)
  private typingUsers = new Map<string, Set<string>>();

  // Simple per-socket rate limiter: socketId -> { lastSentAt, countWindow }
  private messageRate = new Map<string, { lastSentAt: number; count: number }>();



  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,

  ) { }
  afterInit() {
    console.log('Chat Gateway Initialized');
  }

  /**
  * Handle connection
  */
  async handleConnection(client: Socket) {
    try {
      // Extract token
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return client.disconnect();
      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });
      // Store user info
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      await this.setUserOnline(payload.sub, client.id);

      this.logger.log(`User ${payload.sub} connected`);
      // Emit online status
      client.broadcast.emit('user_online', { userId: payload.sub });

    } catch (err) {
      this.logger.error('Invalid WS connection', err);
      client.disconnect();
    }
  }

  // Handle disconnection
  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.deleteUserOnline(userId);

    await this.redisService.del(`typing:*:${userId}`);

    client.broadcast.emit('user_offline', { userId });
    this.logger.warn(`User ${userId} disconnected`);

  }

  // Join chat room
  @SubscribeMessage('join_chat')
  async joinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      const userId = client.data.userId;
      const { chatId } = data;

      // Verify access
      if (!this.chatService.verifyUserAccess(chatId, userId)) {
        return client.emit('error', { message: 'Access Denied' });
      }

      client.join(this.getRoom(chatId));

      // Mark all messages as read
      await this.messageService.markAllAsRead(chatId, userId);
      await this.chatService.resetUnreadCount(chatId, userId);

      client.emit('joined_chat', { chatId });
      this.logger.log(`✅ User ${userId} joined chat ${chatId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  /**
   * Leave chat room
   */
  @SubscribeMessage('leave_chat')
  leaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    client.leave(this.getRoom(data.chatId));
    this.stopTyping(client, data);
    client.emit('left_chat', { chatId: data.chatId });
  }
  /**
   * Send message (real-time)
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
  
      const userId = client.data.userId;
      const { chatId, content } = data;
      const rateKey = `msg_rate:${userId}`;
      const count = await this.redisService.incr(rateKey);

      // Validate
      if (count > 3) {
      return client.emit('error', {
        message: 'Too many messages — slow down',
      });
    }
      if (!content || content.trim().length === 0) {
        client.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      if (content.length > 5000) {
        client.emit('error', { message: 'Message too long (max 5000 characters)' });
        return;
      }

      // Send message
      const message = await this.messageService.sendMessage(
        chatId,
        userId,
        content.trim(),
        'TEXT',
      );

      // Get chat details for recipient
      const chat = await this.chatService.getChatDetails(chatId, userId);

       const recipientUserId =
        chat.doctor.userId === userId
          ? chat.patient.userId
          : chat.doctor.userId;

          
      // Update connection cache
      await this.chatService.updateConnectionLastMessage(
        chat.connectionId,
        message.createdAt,
        content,
      );

      // Determine recipient
    

      // Increment unread count for recipient
      const recipientRole =
        chat.connection.doctor.userId === userId ? 'PATIENT' : 'DOCTOR';
      await this.chatService.incrementUnreadCount(chat.connectionId, recipientRole);

      // Emit to chat room
      this.server.to(`chat:${chatId}`).emit('new_message', message);

      // Confirm to sender
      client.emit('message_sent', { message });

      // Stop typing indicator
      this.handleStopTyping(client, { chatId });

      // Send notification if recipient is offline
      const isRecipientOnline = this.activeUsers.has(recipientUserId);

      if (!isRecipientOnline) {
        await this.notificationsService.createNotification(
          recipientUserId,
          'NEW_CHAT_MESSAGE',
          `New message from ${message.sender.firstName} ${message.sender.lastName}`,
          content.substring(0, 100),
          {
            chatId,
            messageId: message.id,
            senderId: userId,
          },
        );
      }

    
      console.error('Error sending message:', error);
      client.emit('error', { message: error.message });
  }

  /**
   * Mark message as read
   */
  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const userId = client.data.userId;
      const { messageId } = data;

      const message = await this.messageService.markAsRead(messageId, userId);

      // Emit to chat room
      this.server.to(`chat:${message.chatId}`).emit('message_read', {
        messageId,
        readAt: message.readAt,
        readBy: userId,
      });

    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  /**
   * Typing indicator - start
   */
  @SubscribeMessage('typing_start')
  async startTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = client.data.userId;
    const { chatId } = data;
    const key = this.throttleTypingKey(userId,chatId)

    const already = await this.redisService.get(key)
    if(already) return;

    await this.redisService.set(key,'1',5)
    // Emit to others in chat
    client
    .to(this.getRoom(chatId))
    .emit('user_typing', { userId, chatId });
  }

  /**
   * Typing indicator - stop
   */
  @SubscribeMessage('typing_stop')
 async stopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = client.data.userId;
    const { chatId } = data;
       const key = this.throttleTypingKey(userId,chatId)
       await this.redisService.del(key);

    // Emit to others in chat
    client
    .to(this.getRoom(chatId))
    .emit('user_stopped_typing', { userId, chatId });
  }

  /**
   * Get online status
   */
  @SubscribeMessage('check_online')
  handleCheckOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const { userId } = data;
    const isOnline = this.isOnline(userId);

    client.emit('user_status', { userId, isOnline });
  }

  /**
   * Helper: Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.activeUsers.has(userId);
  }

  /**
   * Helper: Get online users count
   */
  getOnlineUsersCount(): number {
    return this.activeUsers.size;
  }
  /**
   * Helper: Get chat room name
   */
  private getRoom(chatId: string): string {
    return `chat:${chatId}`;
  }
  private async setUserOnline(userId: string, socketId: string) {
    await this.redisService.set(`user:${userId}:online`, socketId, 60 * 5);
  }

  private async deleteUserOnline(userId: string) {
    await this.redisService.del(`user:${userId}:online`);
  }
  private async isOnline(userId: string): Promise<boolean> {
    return await this.redisService.get(`user:${userId}:online`) !== null;
  }
  private throttleTypingKey(userId: string, chatId: string) {
    return `typing:${userId}:${chatId}`;
  }



}
