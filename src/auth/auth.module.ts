import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from 'src/email/email.module';
import { LoginProvider } from './providers/login.provider';
import { OtpProvider } from './providers/otp.provider';
import { PasswordProvider } from './providers/password.provider';
import { RegisterProvider } from './providers/register.provider';
import { TokenProvider } from './providers/token.provider';

@Module({
  imports:[
    PassportModule.register({defaultStrategy:'jwt'}),
     JwtModule.registerAsync({
      useFactory: async (config:ConfigService)=>
    ({
      secret:config.get('JWT_SECRET'),
      signOptions:{expiresIn:config.get('JWT_EXPIRES_IN')},
    }),
    inject:[ConfigService]
     }),
     UsersModule,
     EmailModule,
     JwtModule,
     PassportModule,
     ConfigModule
  ],
  controllers: [AuthController],
  providers: [AuthService,LoginProvider,RegisterProvider,OtpProvider,PasswordProvider,TokenProvider],
  exports:[AuthService,JwtModule,PassportModule],
})
export class AuthModule {}
