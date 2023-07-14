import React, { useMemo, useState } from 'react';
import { Layout } from 'antd';
import { useRouter } from 'next/router';

import { useQueryClient } from '@tanstack/react-query';
import { PieChartOutlined } from '@ant-design/icons';
import SidebarReplays from '../../../components/maps/SidebarReplays';
import SidebarSettings from '../../../components/maps/SidebarSettings';
import MapHeader from '../../../components/maps/MapHeader';
import SectorTimeTableModal from '../../../components/maps/SectorTimeTableModal';
import Viewer3D from '../../../components/viewer/Viewer3D';
import HeadTitle from '../../../components/common/HeadTitle';
import { ChartsDrawer } from '../../../components/maps/ChartsDrawer';
import { cleanTMFormatting } from '../../../lib/utils/formatting';
import LoadedReplays from '../../../components/maps/LoadedReplays';
import CleanButton from '../../../components/common/CleanButton';
import API from '../../../lib/api/apiWrapper';
import { ReplayInfo, ReplayData } from '../../../lib/api/requests/replays';
import { useMapReplays } from '../../../lib/api/reactQuery/hooks/query/replays';
import QUERY_KEYS from '../../../lib/api/reactQuery/queryKeys';
import { useMapInfo } from '../../../lib/api/reactQuery/hooks/query/maps';
import {
    createErrorReplayDownloadState,
    createNewReplayDownloadState,
    DownloadState, ReplayDownloadState,
} from '../../../lib/replays/replayDownloadState';
import SectorTimeTableButton from '../../../components/maps/SectorTimeTableButton';
import { filterReplaysWithValidSectorTimes } from '../../../lib/replays/sectorTimes';
import useViewerPerformancePopupConfirmations from '../../../lib/hooks/useViewerPerformancePopupConfirmations';

const Home = (): JSX.Element => {
    const queryClient = useQueryClient();

    const [selectedReplayData, setSelectedReplayData] = useState<ReplayData[]>([]);
    const [replayDownloadStates, setReplayDownloadStates] = useState<Map<string, ReplayDownloadState>>(new Map());
    const [sectorTableVisible, setSectorTableVisible] = useState<boolean>(false);

    const { showViewer } = useViewerPerformancePopupConfirmations();

    const router = useRouter();
    const { mapUId: rawMapUId } = router.query;
    const mapUId = useMemo(() => (typeof rawMapUId === 'string' ? rawMapUId : undefined), [rawMapUId]);

    const {
        data: mapReplaysResult,
        isLoading: isLoadingReplays,
        isFetching: isFetchingReplays,
    } = useMapReplays(mapUId);

    const { data: mapInfo } = useMapInfo(mapUId);

    const selectedReplaysWithValidSectors = useMemo(
        () => filterReplaysWithValidSectorTimes(selectedReplayData, mapReplaysResult?.replays || []),
        [mapReplaysResult?.replays, selectedReplayData],
    );

    const fetchReplayProgressCallback = (replay: ReplayInfo, progressEvent: ProgressEvent) => {
        const loadingState = replayDownloadStates.get(replay._id);

        if (!loadingState) {
            // Create new empty download loading state
            const newLoadingState: ReplayDownloadState = createNewReplayDownloadState(replay._id);
            replayDownloadStates.set(replay._id, newLoadingState);
            setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, newLoadingState)));
        } else {
            // Update replay download state with progress
            loadingState.progress = progressEvent.loaded / progressEvent.total;
            loadingState.state = DownloadState.DOWNLOADING;

            replayDownloadStates.set(replay._id, loadingState);
            setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, loadingState)));
        }
    };

    const onLoadReplay = async (replay: ReplayInfo) => {
        onLoadMultipleReplays([replay]);
    };

    const onLoadMultipleReplays = async (replaysToLoad: ReplayInfo[]) => {
        // Filter out all replays that are already selected, downloaded, or
        const nonLoadedReplays = replaysToLoad.filter(
            (replay) => !(
                selectedReplayData.find((selectedReplay) => selectedReplay._id === replay._id)
                || replayDownloadStates.get(replay._id)?.state === DownloadState.DOWNLOADING
                || replayDownloadStates.get(replay._id)?.state === DownloadState.LOADED
            ),
        );

        // Set replay download states for all replays to progress = 0
        nonLoadedReplays.forEach((replay) => {
            const loadingState = createNewReplayDownloadState(replay._id);
            replayDownloadStates.set(replay._id, loadingState);
            setReplayDownloadStates((prevState) => new Map(prevState.set(replay._id, loadingState)));
        });

        // Create promises to fetch all replay files
        const replayFetchPromises = nonLoadedReplays.map(
            (replay) => API.replays.fetchReplayData(replay, fetchReplayProgressCallback),
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

    const onRemoveReplay = async (replayToRemove: ReplayInfo) => {
        onRemoveMultipleReplays([replayToRemove]);
    };

    const onRemoveAllReplays = async () => {
        setSelectedReplayData([]);
        setReplayDownloadStates(new Map());
    };

    const onRemoveMultipleReplays = async (replaysToRemove: ReplayInfo[]) => {
        // Remove from selected replays
        setSelectedReplayData((selectedReplays) => selectedReplays.filter(
            (replay) => !replaysToRemove.find((replayToRemove) => replayToRemove._id === replay._id),
        ));

        // Remove replay download states
        setReplayDownloadStates((prevState) => {
            replaysToRemove.forEach((replay) => {
                prevState.delete(replay._id);
            });
            return new Map(prevState);
        });
    };

    const title = mapInfo?.mapName
        ? `${cleanTMFormatting(mapInfo.mapName)} - TMDojo`
        : 'TMDojo';

    return (
        <>
            <HeadTitle title={title} />
            <Layout>
                <MapHeader mapInfo={mapInfo} title="Replay viewer" backUrl="/">
                    <CleanButton
                        url={`/maps/${mapInfo?.mapUId}/stats`}
                        backColor="hsl(0, 0%, 15%)"
                        disabled={mapInfo === undefined}
                    >
                        <div className="flex gap-2 items-center">
                            <PieChartOutlined />
                            Stats
                        </div>
                    </CleanButton>
                </MapHeader>

                <SectorTimeTableModal
                    selectedReplays={selectedReplaysWithValidSectors}
                    allReplays={mapReplaysResult?.replays || []}
                    visible={sectorTableVisible}
                    setVisible={setSectorTableVisible}
                />
                <Layout.Content>
                    <SidebarReplays
                        mapUId={`${mapUId}`}
                        replays={mapReplaysResult?.replays || []}
                        loadingReplays={isLoadingReplays}
                        fetchingReplays={isFetchingReplays}
                        onLoadReplay={onLoadReplay}
                        onLoadMultipleReplays={onLoadMultipleReplays}
                        onRemoveReplay={onRemoveReplay}
                        onRemoveAllReplays={onRemoveAllReplays}
                        onRefreshReplays={() => queryClient.invalidateQueries(QUERY_KEYS.mapReplays(mapUId as string))}
                        replayDownloadStates={replayDownloadStates}
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

                    {showViewer && (
                        <Viewer3D replaysData={selectedReplayData} />
                    )}
                </Layout.Content>
            </Layout>
        </>
    );
};

export default Home;
