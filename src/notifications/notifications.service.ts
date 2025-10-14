import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';



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

  /**
   * Notify patient of successful connection
   */
   async notifyPatientConnectionSuccess(
    patientUserId: string,
    doctorName: string,
    doctorEmail: string
  ) {
    return this.createNotification(
      patientUserId,
      NotificationType.CONNECTION_ACCEPTED,
      'Connection Successful',
      `You are now connected with Dr. ${doctorName}`,
      { doctorEmail }
    );
  }
    /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit = 10) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

    /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }


  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

}
