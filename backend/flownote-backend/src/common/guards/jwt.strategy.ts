import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secreto_temporal',
    });
  }

  async validate(payload: any) {
    // Este objeto queda disponible como req.user en los controllers
    return { sub: payload.sub, email: payload.email, nombre: payload.nombre };
  }
}
