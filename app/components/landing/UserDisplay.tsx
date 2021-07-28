import React, { useContext } from 'react';
import Link from 'next/link';
import { Button, message } from 'antd';
import { generateAuthUrl } from '../../lib/api/auth';
import { AuthContext } from '../../lib/contexts/AuthContext';

const LoginButton = () => (
    <Link href={generateAuthUrl('tmdojo')}>
        <Button type="primary">
            Login with Ubisoft
        </Button>
    </Link>
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

    const onLogout = async () => {
        try {
            logoutUser();
        } catch (e) {
            message.error('Something went wrong while logging out.');
        }
    };

    return user === undefined
        ? <LoginButton />
        : (
            <>
                {`Welcome, ${user.displayName}!`}
                <LogoutButton
                    onClick={onLogout}
                />
            </>
        );
};

export default UserDisplay;
