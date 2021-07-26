import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Layout, Spin } from 'antd';
import { authorizeWithAccessCode } from '../../lib/api/auth';

const Home = (): JSX.Element => {
    const router = useRouter();
    const { code, state } = router.query;

    useEffect(() => {
        if (code !== undefined && typeof code === 'string') {
            // TODO:
            // - Check state
            // - Store secret using http only cookies (no localstorage usage)

            const auth = async () => {
                const userInfo = await authorizeWithAccessCode(code);

                localStorage.setItem('displayName', userInfo.displayName);
                localStorage.setItem('accountId', userInfo.accountId);
                localStorage.setItem('sessionSecret', userInfo.sessionSecret);

                router.replace('/');
            };

            auth();
        }
    });

    return (
        <Layout>
            <Layout.Content className="w-3/5 m-auto h-full flex flex-col pt-8">
                <Card
                    className="w-full align-center"
                    title="Redirecting..."
                >
                    <div>
                        Code:
                        {' '}
                        {code}
                    </div>
                    <br />
                    <div>
                        State:
                        {' '}
                        {state}
                    </div>
                    <br />
                    <Spin />
                </Card>
            </Layout.Content>
        </Layout>
    );
};

export default Home;
