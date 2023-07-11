import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MyLogger } from '../common/logger/my-logger.service';
import { TmApiService } from '../common/modules/tm-api/tm-api.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PluginAuthService {
    constructor(
        private readonly tmApiService: TmApiService,
        private readonly usersService: UsersService,
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(PluginAuthService.name);
    }

    async generateAuthUrl(webId: string): Promise<string | null> {
        const playerName = await this.tmApiService.fetchPlayerName(webId);

        if (!playerName) {
            this.logger.error(`Could not get playername from webId: ${webId}`);
            return null;
        }

        const clientCode = this.generatePluginClientCode();

        await this.usersService.upsertUser({
            webId,
            playerName,
            clientCode,
        });
        // await this.usersService.upsertUserWithClientCode(webId, playerName, pluginClientCode);

        return this.buildAuthUrl(clientCode);
    }

    private buildAuthUrl(state: string): string {
        const url = new URL('https://api.trackmania.com/oauth/authorize');

        url.searchParams.append('response_type', 'code');
        url.searchParams.append('client_id', process.env.TM_API_CLIENT_ID);
        url.searchParams.append('redirect_uri', `${process.env.TMDOJO_UI_URL}/auth_redirect`);

        // State is used on front-end to check if auth URL is from plugin or site
        url.searchParams.append('state', state);

        return url.toString();
    }

    private generatePluginClientCode(): string {
        // Do not remove 'plugin-' prefix, is used on front-end to check if the auth URL originates from the plugin
        return `plugin-${uuid()}`;
    }
}
