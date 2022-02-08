import { Request, Response } from 'express';
import axios from 'axios';

export const exchangeCodeForAccessToken = async (req: Request, code: string, redirectUri: string): Promise<any> => {
    const authUrl = 'https://api.trackmania.com/api/access_token';
    const params = {
        grant_type: 'authorization_code',
        client_id: process.env.TM_API_CLIENT_ID,
        client_secret: process.env.TM_API_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
    };

    req.log.debug('exchangeCodeForAccessToken: Attempting to get access token from TM OAuth API');
    // TODO: properly handle errors
    const res = await axios
        .post(authUrl, new URLSearchParams(params).toString())
        .catch((e) => {
            req.log.error('exchangeCodeForAccessToken: TM OAuth request failed');
            req.log.error(e);
        });

    const accessToken = (res as any).data.access_token;
    req.log.debug('exchangeCodeForAccessToken: Received access token from TM OAuth API');
    return accessToken;
};

export const fetchUserInfo = async (req: Request, accessToken: string) => {
    const userUrl = 'https://api.trackmania.com/api/user';
    const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
    };

    req.log.debug('fetchUserInfo: Attempting to get user info from TM API');
    // TODO: properly handle errors
    const res = await axios
        .get(userUrl, config)
        .catch((e) => {
            req.log.error('fetchUserInfo: User info request failed');
            req.log.error(e);
        });

    const userInfo = (res as any).data;
    req.log.debug('fetchUserInfo: Got user info from TM API');
    return userInfo;
};

export const playerLoginFromWebId = (req: Request, webId: string) => {
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
        req.log.debug(`playerLoginFromWebId: Attempting to get player login from webId: ${webId}`);
        const cleanID = webId.replaceAll('-', '');
        const hexValues = hexToIntArray(cleanID);
        const base64 = Buffer.from(hexValues).toString('base64');
        const playerLogin = base64.replace('+', '-').replace('/', '_').replace(/=+$/, '');
        const validLogin = isValidPlayerLogin(playerLogin);
        if (validLogin) {
            req.log.debug(`playerLoginFromWebId: Converted webId to playerLogin: ${playerLogin}`);
            return playerLogin;
        }
        req.log.error(`playerLoginFromWebId: webId "${webId}" is not a valid player login`);
        return undefined;
    } catch (e) {
        req.log.error(`playerLoginFromWebId: Unable to convert webId "${webId}" to a playerLogin:`);
        req.log.error(e);
        return undefined;
    }
};

const setSessionCookieWithAge = (req: Request, res: Response, sessionId: string, age: number) => {
    req.log.debug(`setSessionCookieWithAge: Setting session cookie with age ${age}`);
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
