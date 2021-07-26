import axios from 'axios';

const getRedirectUri = () => {
    if (!process.browser) {
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

    const res = axios.getUri({ url, params });

    return res;
};

interface AuthorizationResponse {
    displayName: string;
    accountId: string;
    sessionSecret: string;
}
export const authorizeWithAccessCode = async (accessCode: string): Promise<AuthorizationResponse> => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/authorize`;

    const params = {
        code: accessCode,
        redirect_uri: getRedirectUri(),
    };

    const { data } = await axios.post(url, params);

    return data;
};

interface MeResponse {
    displayName: string;
    accountId: string;
}
export const fetchMe = async (): Promise<MeResponse | undefined> => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/me`;

    // TODO: remove this and use HttpOnly cookie instead
    const sessionSecret = localStorage.getItem('sessionSecret');

    const params = {
        sessionSecret,
    };

    try {
        const { data } = await axios.post(url, params);
        return data;
    } catch (e) {
        // TODO: cleaner method to
        return undefined;
    }
};

export const logout = async (): Promise<void> => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/logout`;

    // TODO: remove this and use HttpOnly cookie instead
    const sessionSecret = localStorage.getItem('sessionSecret');

    const params = {
        sessionSecret,
    };

    await axios.post(url, params);

    // TODO: move to AuthContext
    localStorage.removeItem('displayName');
    localStorage.removeItem('accountId');

    // TODO: remove HttpOnly cookie here once HttpOnly is working
    localStorage.removeItem('sessionSecret');
};
