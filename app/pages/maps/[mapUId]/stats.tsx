/* eslint-disable no-nested-ternary */
import React, {
    useContext, useEffect, useMemo, useState,
} from 'react';
import { useRouter } from 'next/router';
import {
    Card, Col, Empty, InputNumber, Row, Skeleton, Slider, Spin,
} from 'antd';
import { PlaySquareOutlined } from '@ant-design/icons';
import Title from 'antd/lib/typography/Title';
import HeadTitle from '../../../components/common/HeadTitle';
import { cleanTMFormatting } from '../../../lib/utils/formatting';
import MapHeader from '../../../components/maps/MapHeader';
import ReplayTimesHistogram from '../../../components/mapStats/statistics/ReplayTimesHistogram';
import AggregateMapStats from '../../../components/mapStats/statistics/AggregateMapStats';
import FastestTimeProgression from '../../../components/mapStats/statistics/FastestTimeProgression';
import { useMapReplays } from '../../../lib/api/reactQuery/hooks/query/replays';
import { useMapInfo } from '../../../lib/api/reactQuery/hooks/query/maps';
import { AuthContext } from '../../../lib/contexts/AuthContext';
import { MapStatsType, MapStatsTypeSwitcher } from '../../../components/mapStats/common/MapStatsTypeSwitcher';
import Footer from '../../../components/common/Footer';
import CleanButton from '../../../components/common/CleanButton';
import PageContainer from '../../../components/containers/PageContainer';
import { ReplayInfo } from '../../../lib/api/requests/replays';

const MapStats = () => {
    const { user } = useContext(AuthContext);
    const [mapStatsType, setMapStatsType] = useState(MapStatsType.GLOBAL);

    const router = useRouter();
    const { mapUId } = router.query;

    const {
        data: mapReplayData,
        isLoading: isLoadingReplays,
    } = useMapReplays(typeof mapUId === 'string' ? mapUId : undefined);

    const replays = useMemo(
        () => mapReplayData?.replays || [],
        [mapReplayData?.replays],
    );

    const {
        data: mapInfo,
    } = useMapInfo(typeof mapUId === 'string' ? mapUId : undefined);

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

    const getTitle = () => (mapInfo?.name ? `${cleanTMFormatting(mapInfo.name)} - TMDojo` : 'TMDojo');

    const calcBinSize = (inputReplays: ReplayInfo[]) => {
        if (inputReplays.length === 0) {
            return undefined;
        }

        const minTime = Math.min(...inputReplays.map((r) => r.endRaceTime));
        const maxTime = Math.max(...inputReplays.map((r) => r.endRaceTime));

        const potentialBinSizes = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000];

        let currentBinSize = potentialBinSizes[0];
        for (let i = 1; i <= potentialBinSizes.length; i++) {
            const binSize = potentialBinSizes[i];
            const numBins = (maxTime - minTime) / binSize;

            // Stop increasing binSize if the number of bins exceeds 75 bins
            if (numBins < 75) break;

            currentBinSize = binSize;
        }

        return currentBinSize;
    };

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

    const minTime = Math.min(...allReplaysFilteredByCurrentUser.map((r) => r.endRaceTime));
    const maxTime = Math.max(...allReplaysFilteredByCurrentUser.map((r) => r.endRaceTime));

    const [lower, setLower] = useState(0);
    const [upper, setUpper] = useState(Infinity);

    useEffect(() => {
        const min = Math.min(...allReplaysFilteredByCurrentUser.map((r) => r.endRaceTime));
        const max = Math.max(...allReplaysFilteredByCurrentUser.map((r) => r.endRaceTime));

        setLower(Math.floor(min / 1000) * 1000);
        setUpper(Math.ceil(max / 1000) * 1000);
    }, [allReplaysFilteredByCurrentUser, setLower, setUpper]);

    const replaysFilteredByRange = useMemo(
        () => allReplaysFilteredByCurrentUser
            .filter((r) => r.endRaceTime > lower && r.endRaceTime < upper),
        [allReplaysFilteredByCurrentUser, lower, upper],
    );

    const binSize = useMemo(
        () => calcBinSize(replaysFilteredByRange),
        [replaysFilteredByRange],
    );

    return (
        <div className="flex flex-col items-center min-h-screen bg-page-back">
            <HeadTitle title={getTitle()} />
            <MapHeader
                mapInfo={mapInfo || {}}
                title="Map statistics"
                backUrl="/"
            >
                <CleanButton
                    url={`/maps/${mapInfo?.mapUid}`}
                    backColor="hsl(0, 0%, 15%)"
                    disabled={mapInfo === undefined}
                >
                    <div className="flex gap-2 items-center">
                        <PlaySquareOutlined />
                        3D Viewer
                    </div>
                </CleanButton>
            </MapHeader>

            <PageContainer>
                <div className="w-full mb-8 bg-gray-750 rounded-md p-8">
                    {mapInfo === undefined ? (
                        <Skeleton loading active title={false} />
                    ) : (
                        <MapStatsTypeSwitcher
                            mapStatsType={mapStatsType}
                            mapData={mapInfo}
                            toggleMapStatsType={toggleMapStatsType}
                        />
                    )}
                </div>
                <div className="w-full p-8 bg-gray-750 rounded-md">
                    <div className="flex flex-col h-full gap-4">
                        {allReplaysFilteredByCurrentUser === undefined || allReplaysFilteredByCurrentUser.length === 0
                            ? (
                                isLoadingReplays ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Spin size="large" />
                                        <Title level={5}>Fetching replays...</Title>
                                    </div>
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="No finished replays yet"
                                    />
                                )
                            ) : (
                                <>
                                    <Card
                                        title="Replays"
                                        type="inner"
                                        className="bg-gray-850"
                                    >
                                        <Skeleton loading={isLoadingReplays} active title={false}>
                                            <AggregateMapStats replays={replaysFilteredByRange} />
                                        </Skeleton>
                                    </Card>

                                    <Row>
                                        <Col span={4}>
                                            <InputNumber
                                                min={Math.floor(minTime / 1000) * 1000}
                                                max={Math.ceil(maxTime / 1000) * 1000}
                                                step={1}
                                                style={{ margin: '0 16px' }}
                                                value={lower}
                                                onChange={(v) => setLower(v)}
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <Slider
                                                min={Math.floor(minTime / 1000) * 1000}
                                                max={Math.ceil(maxTime / 1000) * 1000}
                                                step={1}
                                                onChange={([newLower, newUpper]) => {
                                                    setLower(newLower);
                                                    setUpper(newUpper);
                                                }}
                                                range
                                                value={[lower, upper]}
                                            // tooltip={{ formatter: (value: number): string => `${value} secs.` }}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <InputNumber
                                                min={Math.floor(minTime / 1000) * 1000}
                                                max={Math.ceil(maxTime / 1000) * 1000}
                                                step={1}
                                                style={{ margin: '0 16px' }}
                                                value={upper}
                                                onChange={(v) => setUpper(v)}
                                            />
                                        </Col>
                                    </Row>

                                    <Card
                                        title={`Finish Time Histogram ${binSize ? `(${binSize}ms bins)` : ''}`}
                                        type="inner"
                                        className="bg-gray-850"
                                    >
                                        <Skeleton loading={isLoadingReplays} active>
                                            {binSize ? (
                                                <ReplayTimesHistogram
                                                    replays={replaysFilteredByRange}
                                                    binSize={binSize}
                                                />
                                            ) : null}
                                        </Skeleton>
                                    </Card>

                                    <Card
                                        title="Fastest time progression"
                                        type="inner"
                                        className="bg-gray-850"
                                    >
                                        <Skeleton loading={isLoadingReplays} active>
                                            <FastestTimeProgression
                                                replays={replaysFilteredByRange}
                                                userToShowProgression={user}
                                                onlyShowUserProgression={mapStatsType === MapStatsType.PERSONAL}
                                            />
                                        </Skeleton>
                                    </Card>
                                </>
                            )}
                    </div>
                </div>
            </PageContainer>
            <Footer />
        </div>
    );
};

export default MapStats;
