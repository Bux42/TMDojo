import { useRouter } from 'next/router';
import React, {
    createContext, useCallback, useEffect, useState,
} from 'react';
import API from '../api/apiWrapper';
import { AuthUserInfo } from '../api/requests/auth';
import { generateAuthUrl } from '../utils/auth';
import openAuthWindow from '../utils/authPopup';

export interface AuthContextProps {
    user?: AuthUserInfo,
    setUser: (user?: AuthUserInfo) => void,
    loginUser: (code: string, state?: string) => Promise<void>,
    logoutUser: () => Promise<void>
    startAuthFlow: () => void
}

export const AuthContext = createContext<AuthContextProps>({
    user: undefined,
    setUser: (user?: AuthUserInfo) => { },
    loginUser: async (code: string, state?: string) => { },
    logoutUser: async () => { },
    startAuthFlow: () => { },
});

export const AuthProvider = ({ children }: any): JSX.Element => {
    const [user, setUser] = useState<AuthUserInfo>();
    const { asPath } = useRouter();

    useEffect(() => {
        updateLoggedInUser();
    }, [asPath]);

    const updateLoggedInUser = async () => {
        const me = await API.auth.fetchLoggedInUser();
        if (me === undefined) {
            setUser(undefined);
        } else if (me?.accountId !== user?.accountId) {
            setUser(me);
        }
    };

    const startAuthFlow = () => {
        // Generate and store random string as state
        const state = Math.random().toString(36).substring(2); // 11 random lower-case alpha-numeric characters
        localStorage.setItem('state', state);

        // Remove any existing event listeners
        window.removeEventListener('message', receiveAuthEvent);

        openAuthWindow(generateAuthUrl(state), 'Login with Ubisoft');

        // Add the listener for receiving a message from the popup
        window.addEventListener('message', receiveAuthEvent, false);
    };

    const receiveAuthEvent = useCallback(async (event: any) => {
        if (event.origin !== window.origin) {
            return;
        }

        const { data } = event;
        const { source, code, state } = data;
        if (source !== 'ubi-login-redirect') {
            return;
        }

        // We received a message from the auth window, remove this listener
        window.removeEventListener('message', receiveAuthEvent);

        if (code === undefined || code === null || typeof code !== 'string') {
            return;
        }
        if (state === undefined || state === null || typeof state !== 'string') {
            return;
        }

        const storedState = localStorage.getItem('state');
        localStorage.removeItem('state');
        if (storedState !== state) {
            console.log(`Stored state (${storedState}) did not match incoming state (${state})`);
            return;
        }

        await loginUser(code);
    }, []);

    // helper function to make login callable from outside the Context
    const loginUser = async (code: string, state?: string) => {
        try {
            const userInfo = await API.auth.authorizeWithAccessCode(code, state);
            setUser(userInfo);
        } catch (e) {
            console.log(e);
        }
    };

    const logoutUser = async () => {
        try {
            await API.auth.logout();
            setUser(undefined);
        } catch (e: any) {
            // If error code is Unauthorized (so no user is logged in), set user to undefined
            // This should only happen when manually deleting the session cookie
            if (e.response.status === 401) {
                setUser(undefined);
            } else {
                throw e;
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loginUser,
                logoutUser,
                startAuthFlow,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
