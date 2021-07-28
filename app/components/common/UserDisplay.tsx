import React, { useCallback, useContext } from 'react';
import { Button, message } from 'antd';
import { authorizeWithAccessCode, generateAuthUrl } from '../../lib/api/auth';
import { AuthContext } from '../../lib/contexts/AuthContext';

const LoginButton = ({ onClick } :{onClick: () => void}) => (
    <Button type="primary" onClick={onClick}>
        Login with Ubisoft
    </Button>
);

const LogoutButton = ({ onClick } :{onClick: () => void}) => (
    <Button
        type="primary"
        danger
        style={{ marginLeft: '10px' }}
        onClick={onClick}
    >
        Logout
    </Button>
);

let windowObjectReference: Window | null = null;
let previousUrl: string | undefined;

const UserDisplay = () => {
    const { user, setUser, logoutUser } = useContext(AuthContext);

    const onReceivedAuthInfo = async (code: string, state: string) => {
        try {
            const storedState = localStorage.getItem('state');
            localStorage.removeItem('state');
            if (storedState === state) {
                const userInfo = await authorizeWithAccessCode(code);
                setUser(userInfo);
            } else {
                console.log(`Stored state (${storedState}) did not match incoming state (${state})`);
            }
        } catch (e) {
            console.log(e);
        }
    };

    // https://dev.to/dinkydani21/how-we-use-a-popup-for-google-and-outlook-oauth-oci
    const receiveMessage = useCallback((event: any) => {
        // Do we trust the sender of this message? (might be
        // different from what we originally opened, for example).
        if (event.origin !== window.origin) {
            return;
        }

        const { data } = event;
        // if we trust the sender and the source is our popup
        const { source, code, state } = data;
        if (source === 'ubi-login-redirect') {
            if (code !== undefined && code !== null && typeof code === 'string'
                && state !== undefined && state !== null && typeof state === 'string') {
                onReceivedAuthInfo(code, state);
            }
        }
    }, []);

    const openAuthWindow = (
        url: string,
        name: string,
    ) => {
        // remove any existing event listeners
        window.removeEventListener('message', receiveMessage);

        // window features
        const strWindowFeatures = 'toolbar=no, menubar=no, width=600, height=700, top=100, left=100';

        if (windowObjectReference === null || windowObjectReference.closed) {
            /* if the pointer to the window object in memory does not exist
            or if such pointer exists but the window was closed */
            windowObjectReference = window.open(url, name, strWindowFeatures);
        } else {
            if (previousUrl !== url) {
                /* if the resource to load is different,
                then we load it in the already opened secondary window. */
                windowObjectReference = window.open(url, name, strWindowFeatures);
            }
            /* we can bring it back on top of any other
            window with the focus() method. There would be no need to re-create
            the window or to reload the referenced resource. */
            windowObjectReference?.focus();
        }

        // add the listener for receiving a message from the popup
        window.addEventListener('message', receiveMessage, false);

        // assign the previous URL
        previousUrl = url;
    };

    const onLogin = () => {
        // generate and store random string as state
        const state = Math.random().toString(36).substring(2); // 11 random lower-case alpha-numeric characters
        localStorage.setItem('state', state);

        // redirect to Ubisoft auth
        openAuthWindow(generateAuthUrl(state), 'Login with Ubisoft');
    };

    const onLogout = async () => {
        try {
            logoutUser();
        } catch (e) {
            message.error('Something went wrong while logging out.');
        }
    };

    return user === undefined
        ? <LoginButton onClick={onLogin} />
        : (
            <div className="flex flex-row items-center">
                {`Welcome, ${user.displayName}!`}
                <LogoutButton
                    onClick={onLogout}
                />
            </div>
        );
};

export default UserDisplay;
