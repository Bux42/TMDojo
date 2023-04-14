import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OpApiService } from '../common/services/op-api/op-api.service';
import { TmApiService } from '../common/services/tmApi/tmApi.service';
import { UserRo } from '../users/dto/user.ro';
import { UsersService } from '../users/users.service';
import { AccessTokenRo, JwtPayload } from './dto/jwt.dto';
import { PluginLoginDto } from './dto/plugin-login.dto';
import { TmOAuthLoginDto } from './dto/tm-oauth-login.dto';

@Injectable()
export class AuthService {
    logger: Logger;

    constructor(
        private jwtService: JwtService,
        private readonly tmApiService: TmApiService,
        private readonly usersService: UsersService,
        private readonly opApiService: OpApiService,
    ) {
        this.logger = new Logger(AuthService.name);
    }

    async login(user: UserRo): Promise<AccessTokenRo> {
        const payload: JwtPayload = {
            sub: user._id,
            webId: user.webId,
            playerName: user.playerName,
        };

        this.logger.log(`Signing payload: ${JSON.stringify(payload)}`);

        const accessToken = this.jwtService.sign(payload);

        return {
            access_token: accessToken,
        };
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
        // TODO: make sure that whenever a user changes names, the previous user is updated and does not create new user
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

    async validatePluginToken(pluginLoginDto: PluginLoginDto) {
        const { token } = pluginLoginDto;

        // Fetch user info using personalized access token
        const validateTokenResponse = await this.opApiService.validatePluginToken(token);
        if (validateTokenResponse.Error) {
            throw new UnauthorizedException(`Failed to validate plugin token: ${validateTokenResponse.Error}`);
        }

        // Add or get user if already exists
        // TODO: make sure that whenever a user changes names, the previous user is updated and does not create new user
        const { AccountID, DisplayName } = validateTokenResponse;
        const user = await this.usersService.upsertUser({
            webId: AccountID,
            playerName: DisplayName,
        });

        return {
            _id: user._id,
            webId: user.webId,
            playerName: user.playerName,
        };
    }
}
