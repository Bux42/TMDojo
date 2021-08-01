import { Button, PageHeader } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { UserInfo } from '../../lib/api/apiRequests';

interface Props {
    userInfo: UserInfo | undefined;
}

const UserHeader = ({ userInfo }: Props): JSX.Element => {
    const router = useRouter();
    const headerTitle = `User profile of ${userInfo ? userInfo.playerName : 'undefined'}`;
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
        />
    );
};

export default UserHeader;
