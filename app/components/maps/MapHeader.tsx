import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PageHeader, Button } from 'antd';

import { MapInfo } from '../../lib/api/apiRequests';
import { cleanTMFormatting } from '../../lib/utils/formatting';
import UserDisplay from '../common/UserDisplay';

interface Props {
    mapInfo: MapInfo;
}

const MapHeader = ({ mapInfo }: Props): JSX.Element => {
    const router = useRouter();

    const hasExchangeId = mapInfo.exchangeid !== undefined && mapInfo.exchangeid !== 0;
    const hasMapUid = mapInfo.mapUid !== undefined && mapInfo.mapUid !== '';

    const tmioURL = `https://trackmania.io/#/leaderboard/${mapInfo.mapUid}`;
    const tmxURL = `https://trackmania.exchange/maps/${mapInfo.exchangeid}`;

    return (
        <PageHeader
            onBack={() => router.push('/')}
            title="Replay viewer"
            subTitle={(
                <div className="flex flex-row gap-4 items-baseline">
                    {cleanTMFormatting(mapInfo.name || '')}

                    {/* anchors need duplicate links for keyboard accessibility */}
                    <Link href={tmioURL}>
                        <a target="_blank" rel="noreferrer" href={tmioURL}>
                            <Button key="tm.io" type="primary" disabled={!hasMapUid}>
                                Trackmania.io
                            </Button>
                        </a>
                    </Link>

                    <Link href={tmxURL}>
                        <a target="_blank" rel="noreferrer" href={tmxURL}>
                            <Button
                                key="tmx"
                                type="primary"
                                disabled={!hasExchangeId}
                                style={{
                                    backgroundColor: '#13ae63',
                                    borderColor: '#13ae63',
                                }}
                            >
                                TM Exchange
                            </Button>
                        </a>
                    </Link>
                </div>
            )}
            extra={<UserDisplay />}
        />
    );
};

export default MapHeader;
