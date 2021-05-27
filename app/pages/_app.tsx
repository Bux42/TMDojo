/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import HeadTitle from '../components/common/HeadTitle';
import { SettingsProvider } from '../lib/contexts/SettingsContext';
import '../styles/globals.css';

interface Props {
    Component: any;
    pageProps: any;
}

const App = ({ Component, pageProps }: Props): React.ReactElement => (
    <SettingsProvider>
        <HeadTitle />
        <Component {...pageProps} />
    </SettingsProvider>
);

export default App;
