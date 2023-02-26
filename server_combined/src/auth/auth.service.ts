import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    logger: Logger;

    constructor(
        private jwtService: JwtService,
    ) {
        this.logger = new Logger(AuthService.name);
    }

    // validateUser(username: string, password: string) {
    //     this.logger.log(`${username}, ${password}`);
    //     return {
    //         _id: 1,
    //         playerName: 'John Doe',
    //     };
    // }

    async login(user: any) {
        const payload = {
            sub: user._id,
            playerName: user.playerName,
            webId: user.webId,
        };
        this.logger.log(`Signing payload: ${JSON.stringify(payload)}`);
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
