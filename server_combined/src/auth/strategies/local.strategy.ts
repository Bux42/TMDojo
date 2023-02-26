import { Logger, Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    logger: Logger;

    constructor(
        private authService: AuthService,
    ) {
        super();
        this.logger = new Logger(LocalStrategy.name);
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(username, password);
        this.logger.log(`validate: ${username} ${password} ${JSON.stringify(user)}`);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
