const axios = require('axios');

const exchangeCodeForAccessToken = async (code, redirectUri) => {
    const authUrl = 'https://api.trackmania.com/api/access_token';
    const params = {
        grant_type: 'authorization_code',
        client_id: process.env.TM_API_CLIENT_ID,
        client_secret: process.env.TM_API_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
    };

    // TODO: properly handle errors
    const { data } = await axios
        .post(authUrl, new URLSearchParams(params).toString())
        .catch((e) => console.log(e));

    return data.access_token;
};

const fetchUserInfo = async (accessToken) => {
    const userUrl = 'https://api.trackmania.com/api/user';
    const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
    };

    // TODO: properly handle errors
    const { data } = await axios
        .get(userUrl, config)
        .catch((e) => console.log(e));

    return data;
};

const playerLoginFromWebId = (webId) => {
    const hexToIntArray = (inputString) => {
        const str = [];
        for (let i = 0; i < inputString.length; i += 2) {
            str.push(parseInt(inputString.substr(i, 2), 16));
        }
        return str;
    };

    const isValidPlayerLogin = (login) => {
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

const setSessionCookieWithAge = (res, sessionId, age) => {
    res.cookie('sessionId', sessionId, {
        path: '/',
        secure: false, // TODO: enable on HTTPS server
        maxAge: age,
        domain: process.env.NODE_ENV === 'prod' ? 'tmdojo.com' : 'localhost',
    });
};

const setSessionCookie = (res, sessionId) => {
    const age = 1000 * 60 * 60 * 24 * 365; // 365 days
    setSessionCookieWithAge(res, sessionId, age);
};

const setExpiredSessionCookie = (res) => {
    setSessionCookieWithAge(res, '', -1);
};

module.exports = {
    exchangeCodeForAccessToken,
    fetchUserInfo,
    playerLoginFromWebId,
    setSessionCookie,
    setExpiredSessionCookie,
};
