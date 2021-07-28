import { useRouter } from 'next/router';
import React, { createContext, useEffect, useState } from 'react';
import { fetchMe, logout } from '../api/auth';

export interface UserInfo {
    displayName: string,
    accountId: string
}

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
        try {
            const me = await fetchMe();
            if (me === undefined) {
                setUser(undefined);
            } else if (me.accountId !== user?.accountId) {
                setUser(me);
            }
        } catch (e) {
            setUser(undefined);
        }
    };

    useEffect(() => {
        updateLoggedInUser();
    }, [asPath]);

    const logoutUser = async () => {
        await logout();
        setUser(undefined);
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
