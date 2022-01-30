import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import HeadTitle from '../../components/common/HeadTitle';
import {
    getUserInfo,
    UserInfo,
} from '../../lib/api/apiRequests';
import UserReplays from '../../components/users/UserReplays';
import PageHeaderBar from '../../components/common/PageHeaderBar';
import Footer from '../../components/common/Footer';
import PageContainer from '../../components/containers/PageContainer';

const Home = (): JSX.Element => {
    const router = useRouter();
    const [userInfo, setUserInfos] = useState<UserInfo>();
    const { webId } = router.query;
    const getTitle = () => (userInfo ? `${userInfo.playerName} - TMDojo` : 'TMDojo');

    const fetchAndSetUser = async (_webId: string) => {
        const user: UserInfo = await getUserInfo(_webId);
        setUserInfos(user);
    };

    useEffect(() => {
        if (webId !== undefined) {
            fetchAndSetUser(`${webId}`);
        }
    }, [webId]);

    return (
        <div className="flex flex-col items-center min-h-screen w-full bg-page-back">
            <HeadTitle title={getTitle()} />
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
