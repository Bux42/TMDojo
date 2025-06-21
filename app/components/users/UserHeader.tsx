import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, PageHeader } from 'antd';

import { UserInfo } from '../../lib/api/requests/users';
import UserDisplay from '../common/UserDisplay';

interface UserProfilTMIOProps {
    tmioURL: string;
}

const UserProfilTMIO = (props: UserProfilTMIOProps) => {
    const { tmioURL } = props;
    return (
        <Link href={tmioURL}>
            <a
                target="_blank"
                rel="noreferrer"
                href={tmioURL}
            >
                <Button
                    key="tm.io"
                    type="primary"
                >
                    trackmania.io
                </Button>
            </a>
        </Link>
    );
};

interface UserHeaderProps {
    userInfo?: UserInfo;
}

const UserHeader = ({ userInfo }: UserHeaderProps): JSX.Element => {
    const router = useRouter();

    const headerTitle = useMemo(() => {
        if (!userInfo) {
            return 'Profile not found';
        }
        return `User profile of ${userInfo.playerName}`;
    }, [userInfo]);

    const tmioURL = useMemo(() => {
        if (!userInfo) {
            return '';
        }
        return `https://trackmania.io/#/player/${userInfo.webId}`;
    }, [userInfo]);

    return (
        <PageHeader
            onBack={() => router.push('/')}
            title={headerTitle}
            subTitle={tmioURL && <UserProfilTMIO tmioURL={tmioURL} />}
            extra={<UserDisplay />}
        />
    );
};

export default UserHeader;
