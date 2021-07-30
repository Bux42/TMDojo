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

    try {
        const cleanID = webId.replaceAll('-', '');
        const hexValues = hexToIntArray(cleanID);
        const base64 = Buffer.from(hexValues).toString('base64');
        const playerLogin = base64.replace('+', '-').replace('/', '_').replace(/=+$/, '');
        return playerLogin;
    } catch (e) {
        return undefined;
    }
};

module.exports = {
    exchangeCodeForAccessToken,
    fetchUserInfo,
    playerLoginFromWebId,
};
