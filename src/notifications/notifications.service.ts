import { Injectable } from '@nestjs/common';

export enum NotificationType {
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
  QR_SCANNED = 'QR_SCANNED',
  NEW_MESSAGE = 'NEW_MESSAGE'
}

@Injectable()
export class NotificationsService {}
