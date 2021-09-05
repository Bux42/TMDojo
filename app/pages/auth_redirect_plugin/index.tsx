import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Layout, Spin } from 'antd';
import { authorizeWithAccessCode } from '../../lib/api/auth';

const AuthRedirectPlugin = (): JSX.Element => {
    const router = useRouter();
    const { code, state } = router.query;

    // TODO: move this into the AuthContext, and potentially merge this with auth_redirect (keeping both routes though)
    useEffect(() => {
        const authorize = async () => {
            if (
                code !== undefined && typeof code === 'string'
                && state !== undefined && typeof state === 'string'
            ) {
                try {
                    // TODO: handle this response - this should be handled like the normal UI login
                    // it responds with a normal UI session (so the user doesn't have to log in again in the future)
                    await authorizeWithAccessCode(code, state);
                } catch (e) {
                    console.log(e);
                }
            }
        };

        authorize();
    }, [code, state]);

    return (
        <Layout>
            <Layout.Content className="w-4/5 m-auto h-full flex flex-col pt-8">
                <Card
                    className="w-full align-center"
                    title="You can close this window and return to the game now..."
                >
                    <Spin />
                </Card>
            </Layout.Content>
        </Layout>
    );
};

export default AuthRedirectPlugin;
