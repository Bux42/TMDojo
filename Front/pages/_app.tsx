import React from "react";
import "../styles/globals.css";

interface Props {
    Component: any;
    pageProps: any;
}

const MyApp = ({ Component, pageProps }: Props): React.ReactElement => {
    return <Component {...pageProps} />;
};

export default MyApp;
