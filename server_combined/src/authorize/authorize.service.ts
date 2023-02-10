import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { TmApiService } from '../common/services/tmApi/tmApi.service';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { AuthorizeUserDto } from './dto/authorizeUser.dto';

@Injectable()
export class AuthorizeService {
    constructor(
        private readonly tmApiService: TmApiService,
        private readonly usersService: UsersService,
        private readonly sessionsService: SessionsService,
    ) {}

    async authorizeUser(
        req: Request,
        res: Response,
        // eslint-disable-next-line camelcase
        { code, redirect_uri }: AuthorizeUserDto,
    ) {
        // Exchange auth code for access token
        const accessToken = await this.tmApiService.exchangeCodeForAccessToken(code, redirect_uri);
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

        console.log('After setting cookie');

        // TODO: create session
        const session = await this.sessionsService.createSession(user._id);
        this.sessionsService.setSessionCookie(req, res, session.sessionId);

        return { accountId, displayName };
    }
}
