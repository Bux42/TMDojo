import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { PageHeader, Spin } from 'antd';
import { AuthContext } from '../../lib/contexts/AuthContext';

const AuthRedirect = (): JSX.Element => {
    const router = useRouter();
    const { code, state } = router.query;
    const [showLoader, setShowLoader] = useState(true);
    const [message, setMessage] = useState<string>('Logging in...');
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
                        setMessage('Authentication complete!\nYou can close this window and return to the game now.');
                        setShowLoader(false);
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
        <div className="w-screen h-screen bg-page-back">
            <PageHeader
                onBack={() => router.push('/')}
                title="Back"
            />
            <div
                className="w-4/5 h-4/5 m-auto flex flex-col gap-4
                    align-center justify-center p-16 bg-gray-900 rounded-2xl"
            >
                {showLoader && (
                    <Spin size="large" />
                )}
                {message && (
                    <span className="text-xl text-center font-smibold">
                        {message}
                    </span>
                )}
            </div>
        </div>
    );
};

export default AuthRedirect;
