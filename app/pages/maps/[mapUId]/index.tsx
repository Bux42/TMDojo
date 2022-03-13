import React, { useEffect, useState } from 'react';
import { Layout, Modal } from 'antd';
import { useRouter } from 'next/router';

import { PieChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import SidebarReplays from '../../../components/maps/SidebarReplays';
import SidebarSettings from '../../../components/maps/SidebarSettings';
import MapHeader from '../../../components/maps/MapHeader';
import Viewer3D from '../../../components/viewer/Viewer3D';
import {
    getReplays,
    getMapInfo,
    FileResponse,
    fetchReplayData,
    ReplayData,
    MapInfo,
} from '../../../lib/api/apiRequests';
import HeadTitle from '../../../components/common/HeadTitle';
import { ChartsDrawer } from '../../../components/maps/ChartsDrawer';
import { cleanTMFormatting } from '../../../lib/utils/formatting';
import LoadedReplays from '../../../components/maps/LoadedReplays';
import CleanButton from '../../../components/common/CleanButton';
import useIsMobileDevice from '../../../lib/hooks/useIsMobileDevice';
import { FetchedReplay, LoadingState } from '../../../lib/replays/fetchedReplay';

const Home = (): JSX.Element => {
    const [replays, setReplays] = useState<FileResponse[]>([]);
    const [loadingReplays, setLoadingReplays] = useState<boolean>(true);
    const [selectedReplayData, setSelectedReplayData] = useState<ReplayData[]>([]);
    const [fetchedReplays, setFetchedReplays] = useState<FetchedReplay[]>([]);
    const [mapData, setMapData] = useState<MapInfo>({});

    const router = useRouter();
    const { mapUId } = router.query;

    const isMobile = useIsMobileDevice();

    useEffect(() => {
        const shownMobileWarning = localStorage.getItem('mobileViewerWarningShown') !== null;

        if (isMobile && !shownMobileWarning) {
            Modal.warning({
                title: 'You\'re on mobile!',
                // eslint-disable-next-line max-len
                content: 'The 3D viewer is not designed for mobile use - if you want the best experience, visit the 3D viewer on a desktop.',
                centered: true,
                okText: 'Dismiss',
                okType: 'ghost',
                okButtonProps: {
                    size: 'large',
                },
            });

            // Set date of showing warning to today
            localStorage.setItem('mobileViewerWarningShown', dayjs().unix().toString());
        }
    }, [isMobile]);

    const fetchAndSetReplays = async () => {
        setLoadingReplays(true);
        const { files } = await getReplays({ mapUId: `${mapUId}` });
        setReplays(files);
        setFetchedReplays(
            files.map((file) => {
                const loadingReplay = fetchedReplays.find((replay) => replay._id === file._id);

                // keep previous loadedState if found
                if (!loadingReplay) {
                    return {
                        _id: file._id,
                        progress: 0,
                        state: LoadingState.IDLE,
                    };
                }
                return loadingReplay;
            }),
        );
        setLoadingReplays(false);
    };

    useEffect(() => {
        if (mapUId !== undefined) {
            fetchAndSetReplays();
        }

        const fetchMapData = async (mapId: string) => {
            const mapInfo = await getMapInfo(mapId); // TODO: what happens if the map can't be found?
            setMapData(mapInfo);
        };
        if (mapUId !== undefined) {
            fetchMapData(`${mapUId}`);
        }
    }, [mapUId]);

    const updateLoadingReplay = (
        replay: FileResponse,
        progressEvent: ProgressEvent,
    ) => {
        const progressPercent = Math.round((progressEvent.loaded / progressEvent.total) * 100);

        const loadingState = fetchedReplays.find((r) => r._id === replay._id);

        if (loadingState) {
            fetchedReplays[fetchedReplays.indexOf(loadingState)].progress = progressPercent;
            setFetchedReplays([...fetchedReplays]);
        }
    };

    const onLoadReplay = async (replay: FileResponse) => {
        const _replay = replays.find((r) => r._id === replay._id);

        if (_replay) {
            const loadingState = fetchedReplays.find((r) => r._id === replay._id);

            if (loadingState) {
                fetchedReplays[fetchedReplays.indexOf(loadingState)].state = LoadingState.DOWNLOADING;
                setFetchedReplays([...fetchedReplays]);

                const fetchedReplay = await fetchReplayData(replay, (progressEvent: ProgressEvent) => {
                    updateLoadingReplay(_replay, progressEvent);
                });
                if (fetchedReplay && fetchedReplay.state === LoadingState.LOADED) {
                    setSelectedReplayData([...selectedReplayData, fetchedReplay.replay!]);
                }
                fetchedReplays[fetchedReplays.indexOf(loadingState)] = fetchedReplay;
                setFetchedReplays([...fetchedReplays]);
            }
        }
    };

    const onRemoveReplay = async (replayToRemove: FileResponse) => {
        const replayDataFiltered = selectedReplayData.filter(
            (replay) => replay._id !== replayToRemove._id,
        );
        setSelectedReplayData(replayDataFiltered);

        const loadingState = fetchedReplays.find((r) => r._id === replayToRemove._id);
        if (loadingState) {
            fetchedReplays[fetchedReplays.indexOf(loadingState)].progress = 0;
            fetchedReplays[fetchedReplays.indexOf(loadingState)].state = LoadingState.IDLE;
            setFetchedReplays([...fetchedReplays]);
        }
    };

    const onLoadAllVisibleReplays = async (
        allReplays: FileResponse[],
        selectedReplayDataIds: string[],
    ) => {
        const filtered = allReplays.filter(
            (replay) => selectedReplayDataIds.indexOf(replay._id) === -1,
        );

        // make promise array first, then promise.all
        const loadedReplays = await Promise.all(
            filtered.map((replay) => fetchReplayData(replay, (progressEvent) => {
                const loadingState = fetchedReplays.find((r) => r._id === replay._id);

                if (loadingState) {
                    const progressPercent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    fetchedReplays[fetchedReplays.indexOf(loadingState)].progress = progressPercent;
                    fetchedReplays[fetchedReplays.indexOf(loadingState)].state = LoadingState.DOWNLOADING;
                    setFetchedReplays([...fetchedReplays]);
                }
            })),
        );

        setFetchedReplays([...fetchedReplays].map((loadingReplay) => (
            loadedReplays.some((fetchedReplay) => fetchedReplay._id === loadingReplay._id)
                ? loadedReplays.find((fetchedReplay) => fetchedReplay._id === loadingReplay._id)!
                : loadingReplay!
        )));

        const validReplays = loadedReplays
            .filter((replay) => replay.state === LoadingState.LOADED)
            .map((replay) => replay.replay!);

        setSelectedReplayData([...selectedReplayData, ...validReplays]);
    };

    const onRemoveAllReplays = async (replaysToRemove: FileResponse[]) => {
        const replayDataFiltered = selectedReplayData.filter((el) => replaysToRemove.includes(el));
        setSelectedReplayData(replayDataFiltered);

        const loadedReplays = [...fetchedReplays].map((loadingReplay) => ({
            ...loadingReplay,
            state: loadingReplay.state !== LoadingState.IDLE ? LoadingState.IDLE : loadingReplay.state,
            progress: loadingReplay.state !== LoadingState.IDLE ? 0 : loadingReplay.progress,
        }));

        setFetchedReplays(loadedReplays);
    };

    const getTitle = () => (mapData?.name ? `${cleanTMFormatting(mapData.name)} - TMDojo` : 'TMDojo');

    return (
        <>
            <HeadTitle title={getTitle()} />
            <Layout>
                <MapHeader mapInfo={mapData} title="Replay viewer" backUrl="/">
                    <CleanButton
                        url={`/maps/${mapData?.mapUid}/stats`}
                        backColor="hsl(0, 0%, 15%)"
                        disabled={mapData === undefined}
                    >
                        <div className="flex gap-2 items-center">
                            <PieChartOutlined />
                            Stats
                        </div>
                    </CleanButton>
                </MapHeader>
                <Layout.Content>
                    <SidebarReplays
                        mapUId={`${mapUId}`}
                        replays={replays}
                        loadingReplays={loadingReplays}
                        onLoadReplay={onLoadReplay}
                        onRemoveReplay={onRemoveReplay}
                        onLoadAllVisibleReplays={onLoadAllVisibleReplays}
                        onRemoveAllReplays={onRemoveAllReplays}
                        selectedReplayDataIds={selectedReplayData.map((replay) => replay._id)}
                        fetchedReplays={fetchedReplays}
                        onRefreshReplays={fetchAndSetReplays}
                    />
                    {
                        selectedReplayData.length > 0
                        && <LoadedReplays replays={selectedReplayData} />
                    }
                    <SidebarSettings />
                    {
                        selectedReplayData.length > 0
                        && (
                            <ChartsDrawer
                                replaysData={selectedReplayData}
                            />
                        )
                    }
                    <Viewer3D
                        replaysData={selectedReplayData}
                    />
                </Layout.Content>
            </Layout>
        </>
    );
};

export default Home;
