import React from 'react';
import { useRouter } from 'next/router';
import { Card, Skeleton } from 'antd';
import HeadTitle from '../../../components/common/HeadTitle';
import { cleanTMFormatting } from '../../../lib/utils/formatting';
import MapHeader from '../../../components/maps/MapHeader';
import ReplayTimesHistogram from '../../../components/mapStats/ReplayTimesHistogram';
import AggregateMapStats from '../../../components/mapStats/AggregateMapStats';
import FastestTimeProgression from '../../../components/mapStats/FastestTimeProgression';
import useMapReplays from '../../../lib/api/hooks/query/replays';
import { useMapInfo } from '../../../lib/api/hooks/query/maps';

const MapStats = () => {
    const router = useRouter();
    const { mapUId } = router.query;

    const {
        data,
        isLoading: isLoadingReplays,
    } = useMapReplays(typeof mapUId === 'string' ? mapUId : undefined);
    const replays = data?.replays || [];

    const {
        data: mapInfo,
    } = useMapInfo(typeof mapUId === 'string' ? mapUId : undefined);

    const calcBinSize = () => {
        if (replays.length === 0) {
            return undefined;
        }

        const minTime = Math.min(...replays.map((r) => r.endRaceTime));
        const maxTime = Math.max(...replays.map((r) => r.endRaceTime));

        // WIP method for determining bin size using the min and max times
        const binSize = 10 ** (Math.floor(Math.log10(maxTime - minTime)) - 1);
        return binSize;
    };

    const binSize = calcBinSize();

    const title = mapInfo?.name
        ? `${cleanTMFormatting(mapInfo.name)} - TMDojo`
        : 'TMDojo';

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#1F1F1F' }}>
            <HeadTitle title={title} />
            <MapHeader mapInfo={mapInfo} title="Map statistics" />
            {mapInfo && (
                <div className="flex justify-center py-8">
                    <Card
                        className="w-3/5"
                        title={`Map: ${cleanTMFormatting(mapInfo.name || '')}`}
                    >
                        <div className="flex flex-col h-full gap-4">
                            <Card
                                title="Replays"
                                type="inner"
                            >
                                <Skeleton loading={isLoadingReplays} active title={false}>
                                    <AggregateMapStats replays={replays} />
                                </Skeleton>
                            </Card>

                            <Card
                                title={`Finish Time Histogram ${binSize ? `(${binSize}ms bins)` : ''}`}
                                type="inner"
                            >
                                <Skeleton loading={isLoadingReplays} active>
                                    {binSize
                                        && <ReplayTimesHistogram replays={replays} binSize={binSize} />}
                                </Skeleton>
                            </Card>

                            <Card
                                title="Fastest time progression"
                                type="inner"
                            >
                                <Skeleton loading={isLoadingReplays} active>
                                    <FastestTimeProgression replays={replays} />
                                </Skeleton>
                            </Card>
                        </div>
                    </Card>
                </div>

            )}
        </div>
    );
};

export default MapStats;
