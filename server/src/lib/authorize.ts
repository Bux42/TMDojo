import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { RequestLogger } from './logger';

export const exchangeCodeForAccessToken = async (
    log: RequestLogger,
    code: string,
    redirectUri: string,
) : Promise<any> => {
    const authUrl = 'https://api.trackmania.com/api/access_token';
    const params = {
        grant_type: 'authorization_code',
        client_id: process.env.TM_API_CLIENT_ID,
        client_secret: process.env.TM_API_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
    };

    log.debug('exchangeCodeForAccessToken: Attempting to get access token from TM OAuth API');
    // TODO: properly handle errors
    const res = await axios
        .post(authUrl, new URLSearchParams(params).toString())
        .catch((e) => {
            log.error('exchangeCodeForAccessToken: TM OAuth request failed');
            log.error(e);
        });

    const accessToken = (res as any).data.access_token;
    log.debug('exchangeCodeForAccessToken: Received access token from TM OAuth API');
    return accessToken;
};

export const requestTmApiAccessToken = async (log: RequestLogger): Promise<string | undefined> => {
    const accessTokenUrl = 'https://api.trackmania.com/api/access_token';
    const params = {
        grant_type: 'client_credentials',
        client_id: process.env.TM_API_CLIENT_ID,
        client_secret: process.env.TM_API_CLIENT_SECRET,
    };

    log.debug('requestTmApiAccessToken: Attempting to get client credentials access from TM API');

    let res: AxiosResponse<any>;

    try {
        res = await axios.post(accessTokenUrl, new URLSearchParams(params));
    } catch {
        log.error('requestTmApiAccessToken: Unable to fetch access token, TM API request failed');
        return undefined;
    }

    if (!res.data || !res.data.access_token) {
        // eslint-disable-next-line max-len
        log.error(`requestTmApiAccessToken: Did not receive valid access_token from TM API response: ${res.data}`);
        return undefined;
    }

    log.debug('requestTmApiAccessToken: Received access token from TM API');

    return res.data.access_token;
};

export const fetchUserInfo = async (log: RequestLogger, accessToken: string) => {
    const userUrl = 'https://api.trackmania.com/api/user';
    const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
    };

    log.debug('fetchUserInfo: Attempting to get user info from TM API');
    // TODO: properly handle errors
    const res = await axios
        .get(userUrl, config)
        .catch((e) => {
            log.error('fetchUserInfo: User info request failed');
            log.error(e);
        });

    const userInfo = (res as any).data;
    log.debug('fetchUserInfo: Got user info from TM API');
    return userInfo;
};

export const playerLoginFromWebId = (log: RequestLogger, webId: string) => {
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
        log.debug(`playerLoginFromWebId: Attempting to get player login from webId: ${webId}`);
        const cleanID = webId.replaceAll('-', '');
        const hexValues = hexToIntArray(cleanID);
        const base64 = Buffer.from(hexValues).toString('base64');
        const playerLogin = base64.replace('+', '-').replace('/', '_').replace(/=+$/, '');
        const validLogin = isValidPlayerLogin(playerLogin);
        if (validLogin) {
            log.debug(`playerLoginFromWebId: Converted webId to playerLogin: ${playerLogin}`);
            return playerLogin;
        }
        log.error(`playerLoginFromWebId: webId "${webId}" is not a valid player login`);
        return undefined;
    } catch (e) {
        log.error(`playerLoginFromWebId: Unable to convert webId "${webId}" to a playerLogin:`);
        log.error(e);
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

export const fetchPlayerName = async (log: RequestLogger, webId: string): Promise<string | undefined> => {
    const accessToken = await requestTmApiAccessToken(log);

    if (!accessToken) {
        log.error('requestPlayerName: Unable to get access token, cannot request player name');
        return undefined;
    }

    const displayNamesUrl = 'https://api.trackmania.com/api/display-names';
    const config = {
        params: { 'accountId[0]': webId },
        headers: { Authorization: `Bearer ${accessToken}` },
    };

    let res: AxiosResponse<any>;

    try {
        res = await axios.get(displayNamesUrl, config);
    } catch {
        log.error('requestPlayerName: Unable to fetch player name, TM API request failed');
        return undefined;
    }

    if (!res || !res.data) {
        log.error(`requestPlayerName: Unable to fetch player name, invalid TM API response: ${res.data}`);
        return undefined;
    }

    if (res.data[webId] === undefined) {
        // eslint-disable-next-line max-len
        log.error(`requestPlayerName: Unable to fetch player name, webId '${webId}' not found in response: ${res.data}`);
        return undefined;
    }

    return res.data[webId];
};
