import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export enum NotificationType {
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
  QR_SCANNED = 'QR_SCANNED',
  NEW_MESSAGE = 'NEW_MESSAGE'
}

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) {}

    async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: any
    ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata,
        isRead: false
      }
    });
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

}
