import React, { useContext } from 'react';
import { message } from 'antd';
import { AuthContext } from '../../lib/contexts/AuthContext';
import CleanButton from './CleanButton';

const LoginButton = ({ onClick }: { onClick: () => void }) => (
    <CleanButton
        onClick={onClick}
        backColor="#1B65D3"
    >
        Login with Ubisoft
    </CleanButton>
);

const LogoutButton = ({ onClick }: { onClick: () => void }) => (
    <CleanButton
        onClick={onClick}
        backColor="#B41616"
    >
        Logout
    </CleanButton>
);

interface ProfileButtonProps {
    webId: string;
}

const ProfileButton = ({ webId }: ProfileButtonProps) => {
    const userProfileUrl = `/users/${webId}`;
    return (
        <CleanButton
            url={userProfileUrl}
            backColor="#1B65D3"
        >
            Profile
        </CleanButton>
    );
};

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
            <div className="flex flex-col md:flex-row gap-1 md:gap-6 items-center text-sm md:text-base text-right">
                {`Welcome, ${user.displayName}!`}
                <div className="flex gap-4">
                    <ProfileButton webId={user.accountId} />
                    <LogoutButton onClick={onLogout} />
                </div>
            </div>
        );
};

export default UserDisplay;
