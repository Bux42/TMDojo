import React, {
    useContext, useEffect, useMemo, useState,
} from 'react';
import { useRouter } from 'next/router';
import { Card, Empty, Skeleton } from 'antd';
import {
    FileResponse, getMapInfo, getReplays, MapInfo,
} from '../../../lib/api/apiRequests';
import HeadTitle from '../../../components/common/HeadTitle';
import { cleanTMFormatting } from '../../../lib/utils/formatting';
import MapHeader from '../../../components/maps/MapHeader';
import ReplayTimesHistogram from '../../../components/mapStats/statistics/ReplayTimesHistogram';
import AggregateMapStats from '../../../components/mapStats/statistics/AggregateMapStats';
import FastestTimeProgression from '../../../components/mapStats/statistics/FastestTimeProgression';
import { AuthContext } from '../../../lib/contexts/AuthContext';
import { MapStatsType, MapStatsTypeSwitcher } from '../../../components/mapStats/common/MapStatsTypeSwitcher';
import { UserInfo } from '../../../lib/api/auth';

const MapStats = () => {
    const { user } = useContext(AuthContext);

    const [replays, setReplays] = useState<FileResponse[]>([]);
    const [loadingReplays, setLoadingReplays] = useState<boolean>(true);
    const [mapData, setMapData] = useState<MapInfo>();

    const [mapStatsType, setMapStatsType] = useState(MapStatsType.GLOBAL);

    const router = useRouter();
    const { mapUId } = router.query;

    const fetchAndSetReplays = async () => {
        setLoadingReplays(true);

        const { files } = await getReplays({ mapUId: `${mapUId}` });
        setReplays(files);

        setLoadingReplays(false);
    };

    useEffect(() => {
        const fetchMapData = async (mapId: string) => {
            const mapInfo = await getMapInfo(mapId); // TODO: what happens if the map can't be found?
            setMapData(mapInfo);
        };
        if (mapUId !== undefined) {
            fetchAndSetReplays();
            fetchMapData(`${mapUId}`);
        }
    }, [mapUId]);

    // If user object changes, set the according map stats type
    useEffect(() => {
        if (replays) {
            if (user === undefined) {
                setMapStatsType(MapStatsType.GLOBAL);
            } else {
                const userReplays = replays.filter((r) => r.webId === user.accountId);
                if (userReplays.length > 0) {
                    setMapStatsType(MapStatsType.PERSONAL);
                } else {
                    setMapStatsType(MapStatsType.GLOBAL);
                }
            }
        }
    }, [replays, user]);

    const getTitle = () => (mapData?.name ? `${cleanTMFormatting(mapData.name)} - TMDojo` : 'TMDojo');

    const calcBinSize = (inputReplays: FileResponse[]) => {
        if (inputReplays.length === 0) {
            return undefined;
        }

        const minTime = Math.min(...inputReplays.map((r) => r.endRaceTime));
        const maxTime = Math.max(...inputReplays.map((r) => r.endRaceTime));

        // WIP method for determining bin size using the min and max times
        const binSize = 10 ** (Math.floor(Math.log10(maxTime - minTime)) - 1);
        return binSize;
    };

    const binSize = useMemo(() => calcBinSize(replays), [replays]);

    const toggleMapStatsType = () => {
        if (mapStatsType === MapStatsType.GLOBAL) {
            setMapStatsType(MapStatsType.PERSONAL);
        } else {
            setMapStatsType(MapStatsType.GLOBAL);
        }
    };

    const allReplaysFilteredByCurrentUser = useMemo(
        () => {
            const finishedReplays = replays.filter((r) => r.raceFinished === 1);

            if (mapStatsType === MapStatsType.GLOBAL || user === undefined) {
                return finishedReplays;
            }

            const filteredReplays = finishedReplays.filter((r) => r.webId === user.accountId);

            return filteredReplays;
        },
        [user, replays, mapStatsType],
    );

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#1F1F1F' }}>
            <HeadTitle title={getTitle()} />
            <MapHeader mapInfo={mapData || {}} title="Map statistics" />
            {mapData && (
                <div className="flex flex-col items-center py-8">
                    <Card
                        className="w-3/5 mb-8"
                    >
                        <MapStatsTypeSwitcher
                            mapStatsType={mapStatsType}
                            mapData={mapData}
                            toggleMapStatsType={toggleMapStatsType}
                        />
                    </Card>
                    <Card
                        className="w-3/5"
                        title={`Map: ${cleanTMFormatting(mapData?.name || '')}`}
                    >
                        <div className="flex flex-col h-full gap-4">
                            {allReplaysFilteredByCurrentUser.length === 0
                                ? (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="No finished replays yet"
                                    />
                                ) : (
                                    <>
                                        <Card
                                            title="Replays"
                                            type="inner"
                                        >
                                            <Skeleton loading={loadingReplays} active title={false}>
                                                <AggregateMapStats replays={allReplaysFilteredByCurrentUser} />
                                            </Skeleton>
                                        </Card>

                                        <Card
                                            title={`Finish Time Histogram ${binSize ? `(${binSize}ms bins)` : ''}`}
                                            type="inner"
                                        >
                                            <Skeleton loading={loadingReplays} active>
                                                {binSize && (
                                                    <ReplayTimesHistogram
                                                        replays={allReplaysFilteredByCurrentUser}
                                                        binSize={binSize}
                                                    />
                                                )}
                                            </Skeleton>
                                        </Card>

                                        <Card
                                            title="Fastest time progression"
                                            type="inner"
                                        >
                                            <Skeleton loading={loadingReplays} active>
                                                <FastestTimeProgression
                                                    replays={allReplaysFilteredByCurrentUser}
                                                    userToShowProgression={user}
                                                    onlyShowUserProgression={mapStatsType === MapStatsType.PERSONAL}
                                                />
                                            </Skeleton>
                                        </Card>
                                    </>
                                )}
                        </div>
                    </Card>
                </div>

            )}
        </div>
    );
};

export default MapStats;
