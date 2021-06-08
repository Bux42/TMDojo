import React from 'react';
import Head from 'next/head';

interface HeadTitleProps {
    title?: string;
}

const HeadTitle = ({ title }: HeadTitleProps): JSX.Element => {
    const pageTitle = title || 'TMDojo';

    return (
        <Head>
            <title>{pageTitle}</title>
        </Head>
    );
};

export default HeadTitle;
