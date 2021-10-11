import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, Layout, Spin } from 'antd';
import { authorizeWithAccessCode } from '../../lib/api/auth';

const AuthRedirect = (): JSX.Element => {
    const router = useRouter();
    const { code, state } = router.query;
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (
            code !== undefined && typeof code === 'string'
            && state !== undefined && typeof state === 'string'
        ) {
            // find out if this is a UI or a plugin login
            // plugin state is a uuid - UI state is just an 11 character string
            if (state.includes('-')) {
                setMessage('You can close this window and return to the game now...');
                const authorize = async () => {
                    if (
                        code !== undefined && typeof code === 'string'
                        && state !== undefined && typeof state === 'string'
                    ) {
                        try {
                            // TODO: handle this response - this should be handled like the normal UI login
                            // it responds with a normal UI session
                            // (so the user doesn't have to log in again in the future)
                            await authorizeWithAccessCode(code, state);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                };

                authorize();
            // for the UI login, this page should only be opened in a new popup window
            // it should send back the code and state it received to its opener
            } else if (window.opener) {
                setMessage('Redirecting...');
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
                    title={message}
                >
                    <Spin />
                </Card>
            </Layout.Content>
        </Layout>
    );
};

export default AuthRedirect;
