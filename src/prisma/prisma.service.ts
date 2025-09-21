import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class PrismaService  extends PrismaClient implements OnModuleInit , OnModuleDestroy  {
     constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log: configService.get<string>('NODE_ENV') === 'development' ? ['query', 'info', 'warn'] : ['warn', 'error'],
    });
  }
    async onModuleInit() {
       try {
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
    }
    async onModuleDestroy() {
        await this.$disconnect()
        console.log('🔌 Database disconnected');

    }


    
}
