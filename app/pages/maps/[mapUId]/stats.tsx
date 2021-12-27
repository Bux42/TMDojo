import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, Skeleton } from 'antd';
import HeadTitle from '../../../components/common/HeadTitle';
import { cleanTMFormatting } from '../../../lib/utils/formatting';
import MapHeader from '../../../components/maps/MapHeader';
import ReplayTimesHistogram from '../../../components/mapStats/ReplayTimesHistogram';
import AggregateMapStats from '../../../components/mapStats/AggregateMapStats';
import FastestTimeProgression from '../../../components/mapStats/FastestTimeProgression';
import api from '../../../lib/api/apiWrapper';
import { MapInfo } from '../../../lib/api/requests/maps';
import { ReplayInfo } from '../../../lib/api/requests/replays';

const MapStats = () => {
    const [replays, setReplays] = useState<ReplayInfo[]>([]);
    const [loadingReplays, setLoadingReplays] = useState<boolean>(true);
    const [mapData, setMapData] = useState<MapInfo>();

    const router = useRouter();
    const { mapUId } = router.query;

    const fetchAndSetReplays = async () => {
        setLoadingReplays(true);

        const { replays: fetchedReplays } = await api.replays.fetchReplays({ mapUId: `${mapUId}` });
        setReplays(fetchedReplays);

        setLoadingReplays(false);
    };

    useEffect(() => {
        const fetchMapData = async (mapId: string) => {
            const mapInfo = await api.maps.getMapInfo(mapId); // TODO: what happens if the map can't be found?
            setMapData(mapInfo);
        };
        if (mapUId !== undefined) {
            fetchAndSetReplays();
            fetchMapData(`${mapUId}`);
        }
    }, [mapUId]);

    const getTitle = () => (mapData?.name ? `${cleanTMFormatting(mapData.name)} - TMDojo` : 'TMDojo');

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

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#1F1F1F' }}>
            <HeadTitle title={getTitle()} />
            <MapHeader mapInfo={mapData || {}} title="Map statistics" />
            {mapData && (
                <div className="flex justify-center py-8">
                    <Card
                        className="w-3/5"
                        title={`Map: ${cleanTMFormatting(mapData?.name || '')}`}
                    >
                        <div className="flex flex-col h-full gap-4">
                            <Card
                                title="Replays"
                                type="inner"
                            >
                                <Skeleton loading={loadingReplays} active title={false}>
                                    <AggregateMapStats replays={replays} />
                                </Skeleton>
                            </Card>

                            <Card
                                title={`Finish Time Histogram ${binSize ? `(${binSize}ms bins)` : ''}`}
                                type="inner"
                            >
                                <Skeleton loading={loadingReplays} active>
                                    {binSize
                                                && <ReplayTimesHistogram replays={replays} binSize={binSize} />}
                                </Skeleton>
                            </Card>

                            <Card
                                title="Fastest time progression"
                                type="inner"
                            >
                                <Skeleton loading={loadingReplays} active>
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
