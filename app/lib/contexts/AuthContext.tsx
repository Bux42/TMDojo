import { useRouter } from 'next/router';
import React, { createContext, useEffect, useState } from 'react';
import { fetchLoggedInUser, logout, UserInfo } from '../api/auth';

export interface AuthContextProps {
    user?: UserInfo,
    setUser: (user?: UserInfo) => void,
    logoutUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextProps>({
    user: undefined,
    setUser: (user?: UserInfo) => {},
    logoutUser: async () => {},
});

export const AuthProvider = ({ children }: any): JSX.Element => {
    const [user, setUser] = useState<UserInfo>();
    const { asPath } = useRouter();

    const updateLoggedInUser = async () => {
        const me = await fetchLoggedInUser();
        if (me === undefined) {
            setUser(undefined);
        } else if (me?.accountId !== user?.accountId) {
            setUser(me);
        }
    };

    useEffect(() => {
        updateLoggedInUser();
    }, [asPath]);

    const logoutUser = async () => {
        try {
            await logout();
            setUser(undefined);
        } catch (e) {
            // If error code is Unauthorized (so no user is logged in), set user to undefined
            // Should only happen when manually deleting session cookie
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
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
