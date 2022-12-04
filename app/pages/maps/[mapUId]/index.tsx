import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Modal } from 'antd';
import { useRouter } from 'next/router';

import { PieChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import SidebarReplays from '../../../components/maps/SidebarReplays';
import SidebarSettings from '../../../components/maps/SidebarSettings';
import MapHeader from '../../../components/maps/MapHeader';
import SectorTimeTableModal from '../../../components/maps/SectorTimeTableModal';
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
import {
    createErrorReplayDownloadState,
    createNewReplayDownloadState,
    DownloadState, ReplayDownloadState,
} from '../../../lib/replays/replayDownloadState';
import SectorTimeTableButton from '../../../components/maps/SectorTimeTableButton';
import { filterReplaysWithValidSectorTimes } from '../../../lib/replays/sectorTimes';

const Home = (): JSX.Element => {
    const [replays, setReplays] = useState<FileResponse[]>([]);
    const [loadingReplays, setLoadingReplays] = useState<boolean>(true);
    const [selectedReplayData, setSelectedReplayData] = useState<ReplayData[]>([]);
    const [replayDownloadStates, setReplayDownloadStates] = useState<Map<string, ReplayDownloadState>>(new Map());
    const [mapData, setMapData] = useState<MapInfo>({});
    const [sectorTableVisible, setSectorTableVisible] = useState<boolean>(false);

    const router = useRouter();
    const { mapUId } = router.query;

    const isMobile = useIsMobileDevice();

    const selectedReplaysWithValidSectors = useMemo(
        () => filterReplaysWithValidSectorTimes(selectedReplayData, replays),
        [selectedReplayData, replays],
    );

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

        const loadingState = replayDownloadStates.get(replay._id);

        if (loadingState) {
            loadingState.state = DownloadState.DOWNLOADING;
            loadingState.progress = progressPercent;
            setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, loadingState)));
        }
    };

    const onLoadReplayOld = async (replay: FileResponse) => {
        const replayInList = replays.some((r) => r._id === replay._id);
        if (!replayInList) return;

        let loadingState = replayDownloadStates.get(replay._id);

        if (!loadingState) {
            loadingState = {
                _id: replay._id,
                progress: 0,
                state: DownloadState.DOWNLOADING,
            } as ReplayDownloadState;
            replayDownloadStates.set(replay._id, loadingState!);
            setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, loadingState!)));
        }

        loadingState = replayDownloadStates.get(replay._id);

        if (loadingState) {
            setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, loadingState!)));

            const fetchedReplay = await fetchReplayData(replay, (r, progressEvent) => {
                updateLoadingReplay(r, progressEvent);
            });

            if (fetchedReplay && fetchedReplay.state === DownloadState.LOADED) {
                setSelectedReplayData((prevState) => [...prevState, fetchedReplay.replay!]);
            }

            setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, fetchedReplay)));
        }
    };

    const onRemoveReplay = async (replayToRemove: FileResponse) => {
        const replayDataFiltered = selectedReplayData.filter(
            (replay) => replay._id !== replayToRemove._id,
        );
        setSelectedReplayData(replayDataFiltered);

        setReplayDownloadStates((prevDownloadStates) => {
            prevDownloadStates.delete(replayToRemove._id);
            return new Map(prevDownloadStates);
        });
    };

    const onLoadReplay = async (replay: FileResponse) => {
        onLoadMultipleReplays([replay]);
    };

    const fetchReplayProgressCallback = (replay: FileResponse, progressEvent: ProgressEvent) => {
        const loadingState = replayDownloadStates.get(replay._id);

        if (!loadingState) {
            // Replay state not stored yet, create new loading state for this replay
            const newLoadingState: ReplayDownloadState = createNewReplayDownloadState(replay._id);
            replayDownloadStates.set(replay._id, newLoadingState);
            setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, newLoadingState)));
        } else {
            // Update replay download state
            const progressPercent = Math.round((progressEvent.loaded / progressEvent.total) * 100);

            loadingState.progress = progressPercent;
            loadingState.state = DownloadState.DOWNLOADING;

            replayDownloadStates.set(replay._id, loadingState);
            setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, loadingState)));
        }
    };

    const onLoadMultipleReplays = async (replaysToLoad: FileResponse[]) => {
        // Filter out all replays that are already selected
        const nonLoadedReplays = replaysToLoad.filter(
            (replay) => !selectedReplayData.find((selectedReplay) => selectedReplay._id === replay._id),
        );

        // Set replay download states for all replays to progress = 0
        nonLoadedReplays.forEach((replay) => {
            const loadingState = createNewReplayDownloadState(replay._id);
            replayDownloadStates.set(replay._id, loadingState);
            setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, loadingState)));
        });

        // Create promises to fetch all replay files
        const replayFetchPromises = nonLoadedReplays.map(
            (replay) => fetchReplayData(replay, fetchReplayProgressCallback),
        );

        // Await all promises using Promise.allSettled to catch errors
        const replayPromiseResults = await Promise.allSettled(replayFetchPromises);

        // Load all fulfilled replays and set error states for rejected replays
        replayPromiseResults.forEach((promiseResult, index) => {
            if (promiseResult.status === 'fulfilled') {
                // Add all successfully loaded replays to selectedReplayData
                const replayDownload = promiseResult.value;
                if (replayDownload.replay) {
                    setSelectedReplayData((prevState) => [...prevState, replayDownload.replay!]);
                    setReplayDownloadStates((prevState) => new Map(prevState.set(replayDownload._id, replayDownload)));
                }
            } else if (promiseResult.status === 'rejected') {
                // Set replay error states for the failing replays
                const failedReplay = nonLoadedReplays[index];
                const errorState = createErrorReplayDownloadState(failedReplay._id);
                setReplayDownloadStates((prevState) => new Map(prevState.set(failedReplay._id, errorState)));
            }
        });
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
            filtered.map((replay) => fetchReplayData(replay, (progressEvent: any) => {
                const loadingState = replayDownloadStates.get(replay._id);

                if (!loadingState) {
                    // Replay state not stored yet, create new loading state for this replay
                    const newLoadingState: ReplayDownloadState = {
                        _id: replay._id,
                        progress: 0,
                        state: DownloadState.DOWNLOADING,
                    };
                    replayDownloadStates.set(replay._id, newLoadingState);
                    setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, newLoadingState)));
                } else {
                    // Update replay download state
                    const progressPercent = Math.round((progressEvent.loaded / progressEvent.total) * 100);

                    loadingState.progress = progressPercent;
                    loadingState.state = DownloadState.DOWNLOADING;

                    replayDownloadStates.set(replay._id, loadingState);
                    setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, loadingState)));
                }
            })),
        );

        loadedReplays.forEach((loadedReplay) => {
            replayDownloadStates.set(loadedReplay._id, loadedReplay);
        });

        setReplayDownloadStates(new Map(replayDownloadStates));

        const validReplays = loadedReplays
            .filter((replay) => replay.state === DownloadState.LOADED)
            .map((replay) => replay.replay!);

        setSelectedReplayData([...selectedReplayData, ...validReplays]);
    };

    const onRemoveAllReplays = async (replaysToRemove: FileResponse[]) => {
        const replayDataFiltered = selectedReplayData.filter((el) => replaysToRemove.includes(el));
        setSelectedReplayData(replayDataFiltered);

        replayDownloadStates.forEach((fetchedReplay) => {
            replayDownloadStates.delete(fetchedReplay._id);
        });

        setReplayDownloadStates(new Map(replayDownloadStates));
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

                <SectorTimeTableModal
                    selectedReplays={selectedReplaysWithValidSectors}
                    allReplays={replays}
                    visible={sectorTableVisible}
                    setVisible={setSectorTableVisible}
                />

                <Layout.Content>
                    <SidebarReplays
                        mapUId={`${mapUId}`}
                        replays={replays}
                        loadingReplays={loadingReplays}
                        onLoadReplay={onLoadReplay}
                        onLoadMultipleReplays={onLoadMultipleReplays}
                        onRemoveReplay={onRemoveReplay}
                        onRemoveAllReplays={onRemoveAllReplays}
                        selectedReplayDataIds={selectedReplayData.map((replay) => replay._id)}
                        replayDownloadStates={replayDownloadStates}
                        onRefreshReplays={fetchAndSetReplays}
                    />

                    {selectedReplayData.length > 0
                        && <LoadedReplays replays={selectedReplayData} />}

                    <SidebarSettings />

                    {/* TODO: Add back in once sector times are fixed */}
                    {/* <SectorTimeTableButton
                        onClick={() => setSectorTableVisible(!sectorTableVisible)}
                    /> */}

                    {selectedReplayData.length > 0 && (
                        <ChartsDrawer
                            replaysData={selectedReplayData}
                        />
                    )}

                    <Viewer3D
                        replaysData={selectedReplayData}
                    />
                </Layout.Content>
            </Layout>
        </>
    );
};

export default Home;
