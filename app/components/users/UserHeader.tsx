import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, PageHeader } from 'antd';

import { UserInfo } from '../../lib/api/requests/users';
import UserDisplay from '../common/UserDisplay';

interface Props {
    userInfo?: UserInfo;
}

const UserHeader = ({ userInfo }: Props): JSX.Element => {
    const router = useRouter();
    const headerTitle = userInfo ? `User profile of ${userInfo.playerName}` : 'Profile not found';
    const tmioURL = userInfo ? `https://trackmania.io/#/player/${userInfo.webId}` : '';

    return (
        <PageHeader
            onBack={() => router.push('/')}
            title={headerTitle}
            subTitle={(
                <div className="flex flex-row gap-4 items-baseline">
                    {userInfo
                        && (
                            <Link href={tmioURL}>
                                <a target="_blank" rel="noreferrer" href={tmioURL}>
                                    <Button key="tm.io" type="primary">
                                        trackmania.io
                                    </Button>
                                </a>
                            </Link>
                        )}

                </div>
            )}
            extra={<UserDisplay />}
        />
    );
};

export default UserHeader;
