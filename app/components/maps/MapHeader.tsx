import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from 'antd';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { MapInfo } from '../../lib/api/apiRequests';
import { cleanTMFormatting } from '../../lib/utils/formatting';
import UserDisplay from '../common/UserDisplay';
import CleanButton from '../common/CleanButton';

interface Props {
    mapInfo: MapInfo;
    title: string;
}

const MapHeader = ({ mapInfo, title }: Props): JSX.Element => {
    const router = useRouter();

    const hasExchangeId = mapInfo.exchangeid !== undefined && mapInfo.exchangeid !== 0;
    const hasMapUid = mapInfo.mapUid !== undefined && mapInfo.mapUid !== '';

    const tmioURL = `https://trackmania.io/#/leaderboard/${mapInfo.mapUid}`;
    const tmxURL = `https://trackmania.exchange/maps/${mapInfo.exchangeid}`;

    return (
        <div
            className="sticky z-50 top-0 flex flex-row items-center justify-between w-full h-20
                p-10 shadow-md bg-gray-750"
        >
            <div className="flex flex-row gap-4 items-baseline">
                <Button
                    icon={<ArrowLeftOutlined className="text-base" />}
                    type="text"
                    onClick={() => router.back()}
                />

                <span className="text-xl font-bold">
                    {title}
                </span>

                <span className="text-gray-400">
                    {cleanTMFormatting(mapInfo.name || '')}
                </span>

                {/* anchors need duplicate links for keyboard accessibility */}
                <Link href={tmioURL}>
                    <a target="_blank" rel="noreferrer" href={tmioURL}>
                        <CleanButton
                            key="tm.io"
                            type="primary"
                            disabled={!hasMapUid}
                        >
                            Trackmania.io
                        </CleanButton>
                    </a>
                </Link>
                <Link href={tmxURL}>
                    <a target="_blank" rel="noreferrer" href={tmxURL}>
                        <CleanButton
                            key="tmx"
                            type="primary"
                            disabled={!hasExchangeId}
                            backColor="#13ae63"
                        >
                            TM Exchange
                        </CleanButton>
                    </a>
                </Link>
            </div>

            <div className="flex flex-grow items-center justify-end w-0">
                <UserDisplay />
            </div>
        </div>
    );
};

export default MapHeader;
