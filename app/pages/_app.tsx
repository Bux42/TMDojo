/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Head from 'next/head';
import { SettingsProvider } from '../lib/contexts/SettingsContext';
import { AuthProvider } from '../lib/contexts/AuthContext';
import '../styles/globals.css';

interface Props {
    Component: any;
    pageProps: any;
}

const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;

const App = ({ Component, pageProps }: Props): React.ReactElement => (
    <AuthProvider>
        <SettingsProvider>
            <Head>
                {
                    ANALYTICS_ID && (
                        <>
                            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`} />
                            <script
                                // eslint-disable-next-line react/no-danger
                                dangerouslySetInnerHTML={{
                                    __html: `
                                        window.dataLayer = window.dataLayer || [];
                                        function gtag(){dataLayer.push(arguments);}
                                        gtag('js', new Date());
                                        gtag('config', '${ANALYTICS_ID}');
                                    `,
                                }}
                            />
                        </>
                    )
                }
                <link rel="icon" href="/favicon.ico" />
                <title>TMDojo</title>
                <meta name="description" content="The data analysis and visualization platform for Trackmania runs" />

                <meta property="og:url" content="https://tm-dojo-git-addmetatagsforembeds-bux42.vercel.app/" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="TMDojo" />
                <meta
                    property="og:description"
                    content="The data analysis and visualization platform for Trackmania runs"
                />
                <meta
                    property="og:image"
                    content="https://discordapp.com/assets/ba74954dde74ff40a32ff58069e78c36.png"
                />

                <meta name="twitter:card" content="summary_large_image" />
                <meta property="twitter:domain" content="tm-dojo-git-addmetatagsforembeds-bux42.vercel.app" />
                <meta property="twitter:url" content="https://tm-dojo-git-addmetatagsforembeds-bux42.vercel.app/" />
                <meta name="twitter:title" content="TMDojo" />
                <meta
                    name="twitter:description"
                    content="The data analysis and visualization platform for Trackmania runs"
                />
                <meta
                    name="twitter:image"
                    content="https://discordapp.com/assets/ba74954dde74ff40a32ff58069e78c36.png"
                />

                <meta name="theme-color" content="#79515a" />
            </Head>
            <Component {...pageProps} />
        </SettingsProvider>
    </AuthProvider>
);

export default App;
