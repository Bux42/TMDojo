import axios from 'axios';

const generateAuthUrl = (state: string) => {
    const url = 'https://api.trackmania.com/oauth/authorize';

    const params = {
        response_type: 'code',
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
        redirect_uri: `${window.location.origin}/auth_redirect`,
        state,
    };

    const res = axios.getUri({ url, params });

    return res;
};

export default generateAuthUrl;
