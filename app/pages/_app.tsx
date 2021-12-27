/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Head from 'next/head';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { SettingsProvider } from '../lib/contexts/SettingsContext';
import { AuthProvider } from '../lib/contexts/AuthContext';
import '../styles/globals.css';
import queryClient from '../lib/utils/reactQuery/queryClient';

interface Props {
    Component: any;
    pageProps: any;
}

const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;

const App = ({ Component, pageProps }: Props): React.ReactElement => (
    <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen />
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
                </Head>
                <Component {...pageProps} />
            </SettingsProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
