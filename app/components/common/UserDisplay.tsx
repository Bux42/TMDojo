import React, { useCallback, useContext } from 'react';
import { Button, message } from 'antd';
import { authorizeWithAccessCode, generateAuthUrl } from '../../lib/api/auth';
import { AuthContext } from '../../lib/contexts/AuthContext';
import openAuthWindow from '../../lib/utils/authPopup';

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

const UserDisplay = () => {
    const { user, setUser, logoutUser } = useContext(AuthContext);

    const receiveAuthEvent = useCallback(async (event: any) => {
        // Check event origin
        if (event.origin !== window.origin) {
            return;
        }

        // Check source, code, and state
        const { data } = event;
        const { source, code, state } = data;
        if (source !== 'ubi-login-redirect') {
            return;
        }
        if (code === undefined || code === null || typeof code !== 'string') {
            return;
        }
        if (state === undefined || state === null || typeof state !== 'string') {
            return;
        }

        // Check stored state
        const storedState = localStorage.getItem('state');
        localStorage.removeItem('state');
        if (storedState !== state) {
            console.log(`Stored state (${storedState}) did not match incoming state (${state})`);
            return;
        }

        // Check state and exchange access code
        try {
            const userInfo = await authorizeWithAccessCode(code);
            setUser(userInfo);
        } catch (e) {
            console.log(e);
        }
    }, [setUser]);

    const onLogin = () => {
        // Generate and store random string as state
        const state = Math.random().toString(36).substring(2); // 11 random lower-case alpha-numeric characters
        localStorage.setItem('state', state);

        // Open Ubisoft auth popup window
        openAuthWindow(generateAuthUrl(state), 'Login with Ubisoft', receiveAuthEvent);
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
