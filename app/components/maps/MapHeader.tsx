import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PageHeader, Button } from 'antd';

import { MapInfo } from '../../lib/api/apiRequests';
import { cleanTMFormatting } from '../../lib/utils/formatting';

interface Props {
    mapInfo: MapInfo;
}

const MapHeader = ({ mapInfo }: Props): JSX.Element => {
    const router = useRouter();

    const hasExchangeId = mapInfo.exchangeid !== undefined && mapInfo.exchangeid !== 0;

    const TmxButton = () => (
        <Button key="tmx" type="primary" disabled={!hasExchangeId}>
            TM Exchange
        </Button>
    );

    const tmioURL = `https://trackmania.io/#/leaderboard/${mapInfo.mapUid}`;
    const tmxURL = `https://trackmania.exchange/maps/${mapInfo.exchangeid}`;

    return (
        <PageHeader
            onBack={() => router.push('/')}
            title="Replay viewer"
            subTitle={cleanTMFormatting(mapInfo.name || '')}
            // anchors need duplicate links for keyboard accessibility
            extra={(
                <>
                    <Link href={tmioURL}>
                        <a target="_blank" rel="noreferrer" href={tmioURL}>
                            <Button key="tm.io" type="primary">
                                trackmania.io
                            </Button>
                        </a>
                    </Link>

                    {hasExchangeId ? (
                        <Link href={tmxURL}>
                            <a target="_blank" rel="noreferrer" href={tmxURL}>
                                <TmxButton />
                            </a>
                        </Link>
                    ) : (
                        <TmxButton />
                    )}
                </>
            )}
        />
    );
};

export default MapHeader;
