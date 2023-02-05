import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TmApiService {
    async fetchPlayerName(webId: string): Promise<string | null> {
        const accessToken = await this.requestTmApiAccessToken();

        const displayNamesUrl = 'https://api.trackmania.com/api/display-names';
        const config = {
            params: { 'accountId[0]': webId },
            headers: { Authorization: `Bearer ${accessToken}` },
        };

        let data;
        try {
            const res = await axios.get(displayNamesUrl, config);
            if (!res.data) {
                console.log('Error while fetching display name, data empty');
                return null;
            }
            data = res.data;
        } catch (e) {
            console.log('Error while fetching display name');
            return null;
        }

        if (data[webId] === undefined) {
            console.log('Error while fetching display name, response did not contain display name');
            return null;
        }

        return data[webId];
    }

    async requestTmApiAccessToken(): Promise<string> {
        const accessTokenUrl = 'https://api.trackmania.com/api/access_token';
        const params = {
            grant_type: 'client_credentials',
            client_id: process.env.TM_API_CLIENT_ID as string,
            client_secret: process.env.TM_API_CLIENT_SECRET as string,
        };

        let data;
        try {
            const res = await axios.post(accessTokenUrl, new URLSearchParams(params));
            if (!res.data) {
                throw new Error('Error while fetching access token');
            }
            data = res.data;
        } catch (e) {
            throw new Error('Error while fetching access token');
        }

        if (!data.access_token) {
            throw new Error('Error while fetching access token, response did not contain access_token');
        }

        return data.access_token;
    }
}
