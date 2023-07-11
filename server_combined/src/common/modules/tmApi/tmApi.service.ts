import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { TmApiUserInfoRo } from './ro/tmApiUserInfo.ro';

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
                console.error('Error while fetching display name, data empty');
                return null;
            }
            data = res.data;
        } catch (e) {
            console.error('Error while fetching display name');
            return null;
        }

        if (data[webId] === undefined) {
            console.error('Error while fetching display name, response did not contain display name');
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

    async exchangeCodeForAccessToken(code: string, redirectUri: string): Promise<string | null> {
        const authUrl = 'https://api.trackmania.com/api/access_token';
        const params = {
            grant_type: 'authorization_code',
            client_id: process.env.TM_API_CLIENT_ID,
            client_secret: process.env.TM_API_CLIENT_SECRET,
            code,
            redirect_uri: redirectUri,
        };

        // TODO: properly handle errors
        let data;
        try {
            const res = await axios.post(authUrl, new URLSearchParams(params).toString());
            if (!res.data) {
                console.error('Error while exchanging access token, data empty');
                return null;
            }
            data = res.data;
        } catch (e) {
            console.error('Error while exchanging access token');
            return null;
        }

        if (!data.access_token) {
            console.error('Error while exchanging access token, response dit not contain access_token');
            return null;
        }

        return data.access_token;
    }

    async fetchUserInfo(accessToken: string): Promise<TmApiUserInfoRo | null> {
        const userUrl = 'https://api.trackmania.com/api/user';
        const config = {
            headers: { Authorization: `Bearer ${accessToken}` },
        };

        // TODO: properly handle errors
        let data;
        try {
            const res = await axios.get(userUrl, config);
            if (!res.data) {
                console.error('Error while exchanging access token, data empty');
                return null;
            }
            data = res.data;
        } catch (e) {
            console.error('Error while exchanging access token');
            return null;
        }

        return data;
    }
}
