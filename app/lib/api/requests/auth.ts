import { getRedirectUri } from '../../utils/auth';
import apiInstance from '../apiInstance';

interface AuthorizationResponse {
    displayName: string;
    accountId: string;
}
export const authorizeWithAccessCode = async (
    accessCode: string, clientCode?: string,
): Promise<AuthorizationResponse> => {
    const params: any = {
        code: accessCode,
        redirect_uri: getRedirectUri(),
    };

    if (clientCode) {
        // make sure clientCode is only sent if it exists
        params.clientCode = clientCode;
    }

    const { data } = await apiInstance.post('/auth/login/oauth', params, { withCredentials: true });

    apiInstance.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;

    const { data: userInfo } = await apiInstance.get('/auth/me');

    return {
        accountId: userInfo.webId,
        displayName: userInfo.playerName,
    };
};

export interface AuthUserInfo {
    displayName: string;
    accountId: string;
}
export const fetchLoggedInUser = async (): Promise<AuthUserInfo | undefined> => {
    const hasAccessToken = document.cookie
        .split(';')
        .filter((cookie) => cookie.trim().startsWith('access_token='))
        .length > 0;

    if (!hasAccessToken) {
        return undefined;
    }

    try {
        const { data: userInfo } = await apiInstance.get('/auth/me');

        return {
            accountId: userInfo.webId,
            displayName: userInfo.playerName,
        };
    } catch (e) {
        // TODO: find solution for being logged out on a server error?
        return undefined;
    }
};

export const logout = async (): Promise<void> => {
    await apiInstance.post('/auth/logout');
};
