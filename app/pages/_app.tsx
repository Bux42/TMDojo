import React from "react";
import { SettingsProvider } from "../lib/contexts/SettingsContext";
import { GraphProvider } from "../lib/contexts/GraphContext";
import "../styles/globals.css";

interface Props {
    Component: any;
    pageProps: any;
}

const MyApp = ({ Component, pageProps }: Props): React.ReactElement => {
    return (
        <GraphProvider>
            <SettingsProvider>
                <Component {...pageProps} />
            </SettingsProvider>
        </GraphProvider>
    );
};

export default MyApp;
