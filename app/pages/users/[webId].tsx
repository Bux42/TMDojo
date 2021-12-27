import React from 'react';
import { useRouter } from 'next/router';
import { Card, Layout } from 'antd';
import HeadTitle from '../../components/common/HeadTitle';
import UserHeader from '../../components/users/UserHeader';
import UserReplays from '../../components/users/UserReplays';
import { useUserInfo } from '../../lib/api/hooks/query/users';

const Home = (): JSX.Element => {
    const router = useRouter();
    const { webId } = router.query;

    const { data: userInfo } = useUserInfo(typeof webId === 'string' ? webId : undefined);

    const title = userInfo ? `${userInfo.playerName} - TMDojo` : 'TMDojo';

    return (
        <>
            <HeadTitle title={title} />
            <Layout>
                <UserHeader userInfo={userInfo} />
                <Layout.Content className="w-4/5 m-auto h-full flex flex-col pt-8">
                    {userInfo
                        ? (
                            <Card
                                title={userInfo?.playerName}
                            >
                                {userInfo && <UserReplays userInfo={userInfo} />}
                            </Card>
                        ) : (
                            <Card
                                color="red"
                            >
                                Profile not found
                            </Card>
                        )}
                </Layout.Content>
            </Layout>
        </>
    );
};

export default Home;
