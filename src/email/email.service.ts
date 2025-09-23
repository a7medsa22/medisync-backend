import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
     private transporter;
  private readonly logger = new Logger(EmailService.name);
}
