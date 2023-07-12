import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { MyLogger } from '../common/logger/my-logger.service';
import { OpApiService } from '../common/modules/op-api/op-api.service';
import { TmApiService } from '../common/modules/tm-api/tm-api.service';
import { UserRo } from '../users/dto/user.ro';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { JWT_TOKEN_EXPIRATION_SECS } from './auth.module';
import { AccessTokenRo, JwtPayloadData } from './dto/jwt.dto';
import { PluginLoginDto } from './dto/plugin-login.dto';
import { TmOAuthLoginDto } from './dto/tm-oauth-login.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private readonly tmApiService: TmApiService,
        private readonly usersService: UsersService,
        private readonly opApiService: OpApiService,
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(AuthService.name);
    }

    async login(user: UserRo, req: Request, res: Response): Promise<AccessTokenRo> {
        const payload: JwtPayloadData = {
            sub: user._id,
            webId: user.webId,
            playerName: user.playerName,
        };

        this.logger.log(`Signing payload: ${JSON.stringify(payload)}`);

        const accessToken = this.jwtService.sign(payload);

        this.setNewAccessTokenCookie(accessToken, req, res);

        return {
            access_token: accessToken,
        };
    }

    async logout(req: Request, res: Response) {
        this.setExpiredAccessTokenCookie(req, res);
    }

    async validateOAuthCode(tmOAuthLoginDto: TmOAuthLoginDto) {
        const { code, redirect_uri: redirectUri } = tmOAuthLoginDto;

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

        // Add or get user if already exists
        const user = await this.createOrUpdateUser(accountId, displayName);

        return {
            _id: user._id,
            webId: user.webId,
            playerName: user.playerName,
        };
    }

    async validatePluginToken(pluginLoginDto: PluginLoginDto) {
        const { token } = pluginLoginDto;

        // Fetch user info using personalized access token
        const validateTokenResponse = await this.opApiService.validatePluginToken(token);

        if ('error' in validateTokenResponse) {
            this.logger.error(`Error while validating token with OP: ${JSON.stringify(validateTokenResponse.error)}`);
            throw new UnauthorizedException('Failed to validate plugin token using OP.');
        }

        // Add or get user if already exists
        // TODO: make sure that whenever a user changes names, the previous user is updated and does not create new user
        const { accountID, displayName } = validateTokenResponse;

        const user = await this.createOrUpdateUser(accountID, displayName);

        return {
            _id: user._id,
            webId: user.webId,
            playerName: user.playerName,
        };
    }

    private async createOrUpdateUser(webId: string, playerName: string): Promise<User> {
        let user = await this.usersService.findByWebId(webId);

        if (!user) {
            // Implicitly call createUser() for events
            user = await this.usersService.createUser({
                webId,
                playerName,
            });
        } else if (user.playerName === playerName) {
            // Update display name if the user already exists
            await this.usersService.updatePlayerNameByWebId({
                webId,
                playerName,
            });
        }

        return user;
    }

    setAccessTokenCookieWithAge(accessToken: string, age: number, req: Request, res: Response) {
        this.logger.log(`setAccessTokenCookieWithAge: Setting access_token cookie with age ${age}`);
        res.cookie('access_token', accessToken, {
            path: '/',
            secure: req.secure,
            maxAge: age,
            domain: process.env.NODE_ENV === 'PROD' ? 'tmdojo.com' : 'localhost',
        });
    }

    setNewAccessTokenCookie(accessToken: string, req: Request, res: Response) {
        const age = JWT_TOKEN_EXPIRATION_SECS * 1000;
        this.setAccessTokenCookieWithAge(accessToken, age, req, res);
    }

    setExpiredAccessTokenCookie(req: Request, res: Response) {
        this.setAccessTokenCookieWithAge('', -1, req, res);
    }
}
