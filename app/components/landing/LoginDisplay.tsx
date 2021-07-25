import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { generateAuthUrl } from '../../lib/api/auth';

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

const LoginDisplay = () => {
    const [displayName, setDisplayName] = useState<string>();

    useEffect(() => {
        const name = localStorage.getItem('displayName');
        if (name !== null) {
            setDisplayName(name);
        }
    });

    return displayName
        ? (
            <div>
                {`Welcome, ${displayName}!`}
                <LogoutButton
                    onClick={() => {
                        localStorage.removeItem('displayName');
                        localStorage.removeItem('accountId');
                        setDisplayName(undefined);
                    }}
                />
            </div>
        )
        : <LoginButton />;
};

export default LoginDisplay;
