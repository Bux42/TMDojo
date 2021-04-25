import React from "react";
import { SettingsProvider } from "../lib/contexts/SettingsContext";
import "../styles/globals.css";

interface Props {
    Component: any;
    pageProps: any;
}

const MyApp = ({ Component, pageProps }: Props): React.ReactElement => {
    return (
        <SettingsProvider>
            <Component {...pageProps} />
        </SettingsProvider>
    );
};

export default MyApp;
