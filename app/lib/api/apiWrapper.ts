import * as maps from './requests/maps';
import * as users from './requests/users';
import * as replays from './requests/replays';
import * as auth from './requests/auth';

const API = {
    maps,
    users,
    replays,
    auth,
} as const;

export default API;
