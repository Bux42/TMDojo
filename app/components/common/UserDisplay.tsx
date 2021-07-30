import React, { useContext } from 'react';
import { Button, message } from 'antd';
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
    const { user, startAuthFlow, logoutUser } = useContext(AuthContext);

    const onLogout = async () => {
        try {
            logoutUser();
        } catch (e) {
            message.error('Something went wrong while logging out.');
        }
    };

    return user === undefined
        ? <LoginButton onClick={startAuthFlow} />
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
