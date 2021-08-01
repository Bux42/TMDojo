import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, Layout } from 'antd';
import HeadTitle from '../../components/common/HeadTitle';
import {
    getUserInfo,
    UserInfo,
} from '../../lib/api/apiRequests';
import UserHeader from '../../components/users/UserHeader';
import UserReplays from '../../components/users/UserReplays';

const Home = (): JSX.Element => {
    const router = useRouter();
    const [userInfos, setUserInfos] = useState<UserInfo>();
    const { webId } = router.query;
    const getTitle = () => (userInfos ? `${userInfos.playerName} - TMDojo` : 'TMDojo');

    const fetchAndSetUser = async (_webId: string) => {
        const user : UserInfo = await getUserInfo(_webId);
        setUserInfos(user);
    };

    useEffect(() => {
        if (webId !== undefined) {
            fetchAndSetUser(`${webId}`);
        }
    }, [webId]);
    return (
        <>
            <HeadTitle title={getTitle()} />
            <Layout>
                <UserHeader userInfo={userInfos} />
                <Layout.Content className="w-3/5 m-auto h-full flex flex-col pt-8">
                    {userInfos
                    && (
                        <Card
                            title={userInfos?.playerName}
                        >
                            {userInfos && <UserReplays userInfo={userInfos} />}
                        </Card>
                    )}
                    {!userInfos
                    && (
                        <Card
                            color="red"
                        >
                            WebId
                            {' '}
                            {webId}
                            {' '}
                            not found!
                        </Card>
                    )}
                </Layout.Content>
            </Layout>
        </>
    );
};

export default Home;
