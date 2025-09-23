import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { join } from "path";

@Module({
    imports:[MailerModule.forRootAsync({
        inject:[ConfigService],
        useFactory:(config:ConfigService)=>{
            return{
                transport:{
                    host:config.get<string>("SMTP_HOST"),
                    port:config.get<number>("SMTP_PORT"),
                   secure: config.get('SMTP_PORT') === '465', // true for 465, false for other ports
                    auth:{
                        user:config.get<string>("SMTP_USER"),
                        pass:config.get<string>("SMTP_PASS"),
                    }
                    
                },
                defaults:{
                  from: `"No Reply" <${config.get<string>('SMTP_FROM')}>`,
                },
                template:{
                    dir: join(process.cwd(), 'src', 'mails', 'templates'), // 👈 خليها على src
                    adapter: new HandlebarsAdapter(),
                    options:{
                        strict:true,
                    }
                
                }
            }
        }
        ,
    }),
    ConfigModule
],
  providers: [EmailService],
  exports:[EmailService]
})
export class EmailModule {}
