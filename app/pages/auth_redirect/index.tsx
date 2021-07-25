import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Layout, Spin } from 'antd';

const Home = (): JSX.Element => {
    const router = useRouter();
    const { code, state } = router.query;

    useEffect(() => {
        if (code !== undefined) {
            // TODO:
            // - Check state
            // - Get access token
            // - Store access token
            console.log(code, state);

            router.replace('/');
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
