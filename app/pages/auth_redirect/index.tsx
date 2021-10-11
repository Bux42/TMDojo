import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { Card, Layout, Spin } from 'antd';
import { authorizeWithAccessCode } from '../../lib/api/auth';
import { AuthContext } from '../../lib/contexts/AuthContext';

const AuthRedirect = (): JSX.Element => {
    const router = useRouter();
    const { code, state } = router.query;
    const [message, setMessage] = useState('');
    const { loginUser } = useContext(AuthContext);

    useEffect(() => {
        if (
            code !== undefined && typeof code === 'string'
            && state !== undefined && typeof state === 'string'
        ) {
            // find out if this is a UI or a plugin login
            // plugin state starts with "plugin-" - UI state is just an 11 character string
            if (state.startsWith('plugin-') && !window.opener) {
                const authorize = async () => {
                    try {
                        // follow the normal login procedure with the code/state combination
                        await loginUser(code, state);
                        setMessage('You can close this window and return to the game now...');
                    } catch (e) {
                        console.log(e);
                    }
                };

                authorize();
            // for the UI login, this page should only be opened in a new popup window
            // it should send back the code and state it received to its opener
            } else {
                // send them to the opening window
                window.opener.postMessage({ source: 'ubi-login-redirect', code, state });
                setMessage('Redirecting...');
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
