import { Request, Response } from 'express';
import axios from 'axios';

export const exchangeCodeForAccessToken = async (code: string, redirectUri: string): Promise<any> => {
    const authUrl = 'https://api.trackmania.com/api/access_token';
    const params = {
        grant_type: 'authorization_code',
        client_id: process.env.TM_API_CLIENT_ID,
        client_secret: process.env.TM_API_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
    };

    // TODO: properly handle errors
    const res = await axios
        .post(authUrl, new URLSearchParams(params).toString())
        .catch((e) => console.log(e));

    return (res as any).data.access_token;
};

export const fetchUserInfo = async (accessToken: string) => {
    const userUrl = 'https://api.trackmania.com/api/user';
    const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
    };

    // TODO: properly handle errors
    const res = await axios
        .get(userUrl, config)
        .catch((e) => console.log(e));

    return (res as any).data;
};

export const playerLoginFromWebId = (webId: string) => {
    const hexToIntArray = (inputString: string) => {
        const str = [];
        for (let i = 0; i < inputString.length; i += 2) {
            str.push(parseInt(inputString.substr(i, 2), 16));
        }
        return str;
    };

    const isValidPlayerLogin = (login: string) => {
        if (login === undefined) {
            return false;
        }

        const match = login.match('^[a-zA-Z0-9\\-_]{22}$');
        return match !== null && match.length > 0;
    };

    try {
        const cleanID = webId.replaceAll('-', '');
        const hexValues = hexToIntArray(cleanID);
        const base64 = Buffer.from(hexValues).toString('base64');
        const playerLogin = base64.replace('+', '-').replace('/', '_').replace(/=+$/, '');
        return isValidPlayerLogin(playerLogin) ? playerLogin : undefined;
    } catch (e) {
        console.log(`Something went wrong while converting webId "${webId}" to a playerLogin:`);
        console.log(e);
        return undefined;
    }
};

const setSessionCookieWithAge = (req: Request, res: Response, sessionId: string, age: number) => {
    res.cookie('sessionId', sessionId, {
        path: '/',
        secure: req.secure,
        maxAge: age,
        domain: process.env.NODE_ENV === 'prod' ? 'tmdojo.com' : 'localhost',
    });
};

export const setSessionCookie = (req: Request, res: Response, sessionId: string) => {
    const age = 1000 * 60 * 60 * 24 * 365; // 365 days
    setSessionCookieWithAge(req, res, sessionId, age);
};

export const setExpiredSessionCookie = (req: Request, res: Response) => {
    setSessionCookieWithAge(req, res, '', -1);
};
