import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, PageHeader } from 'antd';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { MapInfo } from '../../lib/api/apiRequests';
import { cleanTMFormatting } from '../../lib/utils/formatting';
import UserDisplay from '../common/UserDisplay';
import CleanButton from '../common/CleanButton';
import PageHeaderBar from '../common/PageHeaderBar';

interface Props {
    mapInfo: MapInfo;
    title: string;
}

const MapHeader = ({ mapInfo, title }: Props): JSX.Element => {
    const hasExchangeId = mapInfo.exchangeid !== undefined && mapInfo.exchangeid !== 0;
    const hasMapUid = mapInfo.mapUid !== undefined && mapInfo.mapUid !== '';

    const tmioURL = `https://trackmania.io/#/leaderboard/${mapInfo.mapUid}`;
    const tmxURL = `https://trackmania.exchange/maps/${mapInfo.exchangeid}`;

    return (
        <PageHeaderBar title={title}>
            <span className="text-gray-400">
                {cleanTMFormatting(mapInfo.name || '')}
            </span>

            <CleanButton
                key="tm.io"
                disabled={!hasMapUid}
                backColor="hsl(0, 0%, 15%)"
                url={tmioURL}
                openInNewTab
                className="hidden lg:block"
            >
                TM.io
            </CleanButton>
            <CleanButton
                key="tmx"
                disabled={!hasExchangeId}
                backColor="hsl(0, 0%, 15%)"
                url={tmxURL}
                openInNewTab
                className="hidden lg:block"
            >
                TMX
            </CleanButton>
        </PageHeaderBar>
    );
};

export default MapHeader;
