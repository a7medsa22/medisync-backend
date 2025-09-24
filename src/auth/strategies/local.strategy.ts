import { PassportStrategy } from "@nestjs/passport";

import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthService } from "../auth.service";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { privateDecrypt } from "crypto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService,
    private config:ConfigService
  ) {
    super({
      secretOrKey: config.get('JWT_SECRET')!,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}