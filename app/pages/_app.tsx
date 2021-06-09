/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import HeadTitle from '../components/common/HeadTitle';
import { SettingsProvider } from '../lib/contexts/SettingsContext';
import { GraphProvider } from '../lib/contexts/GraphContext';
import '../styles/globals.css';

interface Props {
    Component: any;
    pageProps: any;
}

const App = ({ Component, pageProps }: Props): React.ReactElement => (
    <SettingsProvider>
        <GraphProvider>
            <HeadTitle />
            <Component {...pageProps} />
        </GraphProvider>
    </SettingsProvider>
);

export default App;
