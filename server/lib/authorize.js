const axios = require('axios');

const querystring = require('querystring');

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
        .post(authUrl, querystring.stringify(params))
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

module.exports = {
    exchangeCodeForAccessToken,
    fetchUserInfo,
};
