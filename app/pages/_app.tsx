import React from "react";
import { SettingsProvider } from "../lib/contexts/SettingsContext";
import "../styles/globals.css";

interface Props {
    Component: any;
    pageProps: any;
}

const MyApp = ({ Component, pageProps }: Props): React.ReactElement => {
	console.log("env:", process.env);
	console.log("nodeApi:", process.env.NODE_API_VERCEL);
    return (
        <SettingsProvider>
            <Component {...pageProps} />
        </SettingsProvider>
    );
};

export default MyApp;
