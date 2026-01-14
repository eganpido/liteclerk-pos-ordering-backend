import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            // Kuhaon ang token gikan sa Authorization header as Bearer token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default_fallback_secret',
        });
    }

    // Kini nga function modagan matag request human ma-validate ang token
    async validate(payload: any) {
        // Ang i-return ani nga object mao ang mahimong "req.user"
        return {
            userId: payload.sub,
            username: payload.username,
            fullName: payload.fullName,
            terminalId: payload.terminalId,
            terminalNumber: payload.terminalNumber
        };
    }
}