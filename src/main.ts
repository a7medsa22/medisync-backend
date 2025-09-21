import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet'
import compression from 'compression'
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService)

  app.use(helmet())
  app.use(compression())
  app.enableCors({
    origin: config.get('CORS_ORIGIN').split(',') ?? ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  app.enableVersioning({
    type:VersioningType.URI,
    defaultVersion:'1',
  })


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
