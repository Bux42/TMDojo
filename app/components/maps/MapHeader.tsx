import React from 'react';

import { cleanTMFormatting } from '../../lib/utils/formatting';
import { MapInfo } from '../../lib/api/requests/maps';
import CleanButton from '../common/CleanButton';
import PageHeaderBar from '../common/PageHeaderBar';

interface Props {
    mapInfo?: MapInfo;
    title: string;
    backUrl?: string;
    children?: React.ReactNode
}

const MapHeader = ({
    mapInfo, title, backUrl, children,
}: Props): JSX.Element => {
    const hasExchangeId = mapInfo?.exchangeId !== undefined && mapInfo.exchangeId !== 0;
    const hasMapUid = mapInfo?.mapUId !== undefined && mapInfo.mapUId !== '';

    const tmioURL = mapInfo?.mapUId ? `https://trackmania.io/#/leaderboard/${mapInfo.mapUId}` as const : undefined;
    const tmxURL = mapInfo?.exchangeId ? `https://trackmania.exchange/maps/${mapInfo.exchangeId}` as const : undefined;

    return (
        <PageHeaderBar
            title={title}
            subtitle={cleanTMFormatting(mapInfo?.mapName || '')}
            backUrl={backUrl}
        >
            <CleanButton
                key="tm.io"
                disabled={!hasMapUid}
                backColor="hsl(0, 0%, 15%)"
                url={tmioURL}
                openInNewTab
            >
                TM.io
            </CleanButton>
            <CleanButton
                key="tmx"
                disabled={!hasExchangeId}
                backColor="hsl(0, 0%, 15%)"
                url={tmxURL}
                openInNewTab
            >
                TMX
            </CleanButton>

            {children}

        </PageHeaderBar>
    );
};

export default MapHeader;
