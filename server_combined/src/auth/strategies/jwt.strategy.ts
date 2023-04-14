import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { config } from 'dotenv';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../dto/jwt.dto';
import { UserRo } from '../../users/dto/user.ro';

config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    logger: Logger;

    constructor(
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                JwtStrategy.extractJwtFromCookies,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
        this.logger = new Logger(JwtStrategy.name);
    }

    async validate(payload: JwtPayload): Promise<UserRo> {
        this.logger.log(`Validated token, payload: ${JSON.stringify(payload)}`);
        const userId = payload.sub;

        const user = await this.usersService.findById(userId);

        return {
            _id: user._id,
            webId: user.webId,
            playerName: user.playerName,
        };
    }

    private static extractJwtFromCookies(req: Request): string | null {
        if (req.cookies
            && 'access_token' in req.cookies
            && req.cookies.access_token.length > 0) {
            return req.cookies.access_token;
        }
        return null;
    }
}
