import axios from 'axios';
import apiInstance from './apiInstance';

const getRedirectUri = () => {
    if (typeof window === 'undefined') {
        // Avoid some nextjs compilation errors regarding window being undefined
        return undefined;
    }
    return `${window.location.origin}/auth_redirect`;
};

export const generateAuthUrl = (state: string): string => {
    const url = 'https://api.trackmania.com/oauth/authorize';

    const params = {
        response_type: 'code',
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
        redirect_uri: getRedirectUri(),
        state,
    };

    return axios.getUri({ url, params });
};

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

    const { data } = await apiInstance.post('/authorize', params, { withCredentials: true });

    return data;
};

export interface UserInfo {
    displayName: string;
    accountId: string;
}
export const fetchLoggedInUser = async (): Promise<UserInfo | undefined> => {
    const hasSessionCookie = document.cookie
        .split(';')
        .filter((cookie) => cookie.trim().startsWith('sessionId='))
        .length > 0;

    if (!hasSessionCookie) {
        return undefined;
    }

    try {
        const { data } = await apiInstance.post('/me');
        return data;
    } catch (e) {
        // TODO: find solution for being logged out on a server error?
        return undefined;
    }
};

export const logout = async (): Promise<void> => {
    await apiInstance.post('/logout');
};
