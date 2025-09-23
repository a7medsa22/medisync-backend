import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[
     JwtModule.registerAsync({
      useFactory: async (config:ConfigService)=>
    ({
      secret:config.get('JWT_SECRET'),
      signOptions:{expiresIn:config.get('JWT_EXPIRES_IN')},
    }),
    inject:[ConfigService]
     }),
     JwtModule,
     PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
