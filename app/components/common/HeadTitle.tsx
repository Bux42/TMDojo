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
            <title>{pageTitle}</title>
        </Head>
    );
};

export default HeadTitle;
