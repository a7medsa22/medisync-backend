import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QrProvider } from './qr.provider';

@Module({
  imports:[PrismaModule],
  controllers: [QrController],
  providers: [QrService,QrProvider],
})
export class QrModule {}
