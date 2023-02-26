import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { config } from 'dotenv';
import { Request } from 'express';
import { TmApiService } from '../../common/services/tmApi/tmApi.service';
import { UsersService } from '../../users/users.service';

config();

@Injectable()
export class TmOAuthStrategy extends PassportStrategy(Strategy, 'tmoauth') {
    logger: Logger;

    constructor(
        private readonly tmApiService: TmApiService,
        private readonly usersService: UsersService,
    ) {
        super();
        this.logger = new Logger(TmOAuthStrategy.name);
        this.logger.log('TmOAuthStrategy constructor');
    }

    async validate(request: Request) {
        const { code, redirect_uri: redirectUri } = request.body;

        this.logger.log(JSON.stringify({ code, redirectUri }));

        // Exchange auth code for access token
        const accessToken = await this.tmApiService.exchangeCodeForAccessToken(code, redirectUri);
        if (!accessToken) {
            throw new UnauthorizedException('Failed to exchange access token');
        }

        // Fetch user info using personalized access token
        const userInfo = await this.tmApiService.fetchUserInfo(accessToken);
        if (!userInfo) {
            throw new UnauthorizedException('Failed to fetch user info');
        }
        const { accountId, displayName } = userInfo;

        // Add user
        const user = await this.usersService.upsertUser({
            webId: accountId,
            playerName: displayName,
        });

        return {
            _id: user._id,
            webId: user.webId,
            playerName: user.playerName,
        };
    }
}
