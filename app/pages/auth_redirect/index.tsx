import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Layout, Spin } from 'antd';

const AuthRedirect = (): JSX.Element => {
    const router = useRouter();
    const { code, state } = router.query;

    useEffect(() => {
        if (code !== undefined && typeof code === 'string'
            && state !== undefined && typeof state === 'string') {
            // this page should only be opened in a new popup window
            // it should send back the code and state it received to its opener
            if (window.opener) {
                // send them to the opening window
                window.opener.postMessage({ source: 'ubi-login-redirect', code, state });
                // close the popup
                window.close();
            }
        }
    }, [code, state]);

    return (
        <Layout>
            <Layout.Content className="w-4/5 m-auto h-full flex flex-col pt-8">
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

export default AuthRedirect;
