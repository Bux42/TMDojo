import React from 'react';
import Head from 'next/head';
import { MapInfo } from '../../lib/api/apiRequests';
import { cleanTMFormatting } from '../../lib/utils/formatting';

interface HeadTitleProps {
    mapInfo?: MapInfo;
}

const HeadTitle = ({ mapInfo }: HeadTitleProps): JSX.Element => {
    const mapName = mapInfo && mapInfo.name && cleanTMFormatting(mapInfo.name);

    const pageTitle = `${mapName ? `${mapName} -` : ''} TMDojo`;

    return (
        <Head>
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-0V30RMEPFN"></script>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                
                    gtag('config', 'G-0V30RMEPFN');
                `,
                }}
            />
            <title>{pageTitle}</title>
        </Head>
    );
};

export default HeadTitle;
