import React, { createContext, useState } from 'react';

export interface UserInfo {
    displayName: string,
    accountId: string
}

export interface AuthContextProps {
    user?: UserInfo,
    setUser: (user?: UserInfo) => void
}

export const AuthContext = createContext<AuthContextProps>({
    user: undefined,
    setUser: (user?: UserInfo) => {},
});

export const AuthProvider = ({ children }: any): JSX.Element => {
    const [user, setUser] = useState<UserInfo>();

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
