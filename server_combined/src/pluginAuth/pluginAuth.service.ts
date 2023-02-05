import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { TmApiService } from '../common/services/tmApi/tmApi.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PluginAuthService {
    constructor(
        private readonly tmApiService: TmApiService,
        private readonly usersService: UsersService,
    ) { }

    async generateAuthUrl(webId: string): Promise<string> {
        const playerName = await this.tmApiService.fetchPlayerName(webId);

        if (!playerName) {
            console.error(`Could not get playername from webId: ${webId}`);
            return null;
        }

        const pluginClientCode = this.generatePluginClientCode();

        await this.usersService.upsertUserWithClientCode(webId, playerName, pluginClientCode);

        return this.buildAuthUrl(pluginClientCode);
    }

    private buildAuthUrl(state: string): string {
        const url = new URL('https://api.trackmania.com/oauth/authorize');

        url.searchParams.append('response_type', 'code');
        url.searchParams.append('client_id', process.env.TM_API_CLIENT_ID);
        url.searchParams.append('redirect_uri', `${process.env.TMDOJO_UI_URL}/auth_redirect`);
        url.searchParams.append('state', state);

        return url.toString();
    }

    private generatePluginClientCode(): string {
        return `plugin-${uuid()}`;
    }
}
