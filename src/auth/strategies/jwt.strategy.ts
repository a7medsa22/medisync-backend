import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { AuthService } from "../auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

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

  async validate(payload: JwtPayload) {
   try {
    const user = await this.authService.validateJwtPayload(payload);
      if(!user)
        throw new UnauthorizedException('User not found or inactive');
      
       return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        status: payload.status,
        doctorId: payload.doctorId,
        patientId: payload.patientId,
      };
   } catch (error) {
          throw new UnauthorizedException('Invalid token');
   }
  }
}
