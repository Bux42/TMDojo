import axios from 'axios';

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
export const authorizeWithAccessCode = async (accessCode: string): Promise<AuthorizationResponse> => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/authorize`;

    const params = {
        code: accessCode,
        redirect_uri: getRedirectUri(),
    };

    // TODO: use custom axios instance with default config for withCredentials
    const { data } = await axios.post(url, params, { withCredentials: true });

    return data;
};

export interface UserInfo {
    displayName: string;
    accountId: string;
}
export const fetchLoggedInUser = async (): Promise<UserInfo | undefined> => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/me`;

    try {
        // TODO: use custom axios instance with default config for withCredentials
        const { data } = await axios.post(url, {}, { withCredentials: true });
        return data;
    } catch (e) {
        // TODO: find solution for being logged out on a server error?
        return undefined;
    }
};

export const logout = async (): Promise<void> => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/logout`;

    // TODO: use custom axios instance with default config for withCredentials
    await axios.post(url, {}, { withCredentials: true });
};
