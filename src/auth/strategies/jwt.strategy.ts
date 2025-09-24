import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { AuthService } from "../auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config:ConfigService,
      private authService:AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
   try {
    const user = await this.authService.validateJwtPayload(payload);
      if(!user)
        throw new UnauthorizedException('User not found or inactive');
      
      return user
   } catch (error) {
          throw new UnauthorizedException('Invalid token');
   }
  }
}
