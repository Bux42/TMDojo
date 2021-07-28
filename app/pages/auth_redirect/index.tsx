import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Layout, Spin } from 'antd';
import { authorizeWithAccessCode } from '../../lib/api/auth';
import { AuthContext } from '../../lib/contexts/AuthContext';

const Home = (): JSX.Element => {
    const router = useRouter();
    const { code, state } = router.query;
    const { setUser } = useContext(AuthContext);

    useEffect(() => {
        if (code !== undefined && typeof code === 'string') {
            // TODO:
            // - Check state

            (async () => {
                try {
                    const userInfo = await authorizeWithAccessCode(code);
                    setUser(userInfo);
                } catch (e) {
                    console.log(e);
                } finally {
                    // redirect to original URL if available, fall back to landing page
                    const originalURL = localStorage.getItem('originalURL');
                    if (originalURL) {
                        localStorage.removeItem('originalURL');
                        router.replace(originalURL);
                    } else {
                        router.replace('/');
                    }
                }
            })();
        }
    }, [code]);

    return (
        <Layout>
            <Layout.Content className="w-1/5 m-auto h-full flex flex-col pt-8">
                <Card
                    className="w-full align-center"
                    title="Redirecting..."
                >
                    <Spin />
                </Card>
            </Layout.Content>
        </Layout>
    );
};

export default Home;
