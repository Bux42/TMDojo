import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { Button, message } from 'antd';
import { generateAuthUrl } from '../../lib/api/auth';
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

const UserDisplay = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const router = useRouter();

    const onLogin = () => {
        // keep the current route for redirecting back after login
        localStorage.setItem('originalURL', router.asPath);

        // generate and store random string as state
        const state = Math.random().toString(36).substring(2); // 11 random lower-case alpha-numeric characters
        localStorage.setItem('state', state);

        // redirect to Ubisoft auth
        router.replace(generateAuthUrl(state));
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
