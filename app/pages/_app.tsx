/* eslint-disable max-len */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SettingsProvider } from '../lib/contexts/SettingsContext';
import { AuthProvider } from '../lib/contexts/AuthContext';
import '../styles/globals.css';
import queryClient from '../lib/api/reactQuery/queryClient';

const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;

const App = ({ Component, pageProps }: AppProps): React.ReactElement => (
    <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen />
        <AuthProvider>
            <SettingsProvider>
                <Head>
                    {ANALYTICS_ID && (
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
                    )}
                    <link rel="icon" href="/favicon.ico" />
                    <title>TMDojo</title>
                    <meta name="description" content="The data analysis and visualization platform for Trackmania runs" />

                    <meta property="og:url" content="https://tmdojo.com" />
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="TMDojo" />
                    <meta
                        property="og:description"
                        content="The data analysis and visualization platform for Trackmania runs"
                    />
                    <meta
                        property="og:image"
                        content="https://tmdojo.com/images/tmdojo_preview.jpg"
                    />

                    <meta property="twitter:domain" content="tmdojo.com" />
                    <meta property="twitter:url" content="https://tmdojo.com" />
                    <meta name="twitter:title" content="TMDojo" />
                    <meta
                        name="twitter:description"
                        content="The data analysis and visualization platform for Trackmania runs"
                    />
                    <meta
                        name="twitter:image"
                        content="https://tmdojo.com/images/tmdojo_preview.jpg"
                    />

                    <meta name="theme-color" content="#916c84" />
                </Head>
                <Component {...pageProps} />
            </SettingsProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
