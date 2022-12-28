import React, { useMemo } from 'react';
import { useRouter } from 'next/router';

import { useUserInfo } from '../../lib/api/reactQuery/hooks/query/users';

import HeadTitle from '../../components/common/HeadTitle';
import UserReplays from '../../components/users/UserReplays';
import PageHeaderBar from '../../components/common/PageHeaderBar';
import Footer from '../../components/common/Footer';
import PageContainer from '../../components/containers/PageContainer';

const Home = (): JSX.Element => {
    const router = useRouter();
    const { webId } = router.query;

    const { data: userInfo } = useUserInfo(typeof webId === 'string' ? webId : undefined);

    const title = useMemo(
        () => (userInfo ? `${userInfo.playerName} - TMDojo` : 'TMDojo'),
        [userInfo],
    );

    return (
        <div className="flex flex-col items-center min-h-screen w-full bg-page-back">
            <HeadTitle title={title} />
            <PageHeaderBar title={userInfo?.playerName || ''} backUrl="/" />

            <PageContainer>
                <div className="w-full mb-8 bg-gray-750 rounded-md p-8 text-center">
                    <span className="text-small">User profile of:</span>
                    <br />
                    <span className="text-2xl font-bold">{userInfo?.playerName}</span>
                </div>

                <div className="w-full p-8 bg-gray-750 rounded-md">
                    {userInfo ? (
                        userInfo && <UserReplays userInfo={userInfo} />
                    ) : (
                        'Profile not found'
                    )}
                </div>
            </PageContainer>

            <Footer />
        </div>
    );
};

export default Home;
