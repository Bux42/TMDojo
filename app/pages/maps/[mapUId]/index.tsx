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

    const fetchReplayProgressCallback = (replay: FileResponse, progressEvent: ProgressEvent) => {
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

    const onLoadReplay = async (replay: FileResponse) => {
        onLoadMultipleReplays([replay]);
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

    const onRemoveReplay = async (replayToRemove: FileResponse) => {
        onRemoveMultipleReplays([replayToRemove]);
    };

    const onRemoveAllReplays = async () => {
        onRemoveMultipleReplays(selectedReplayData);
    };

    const onRemoveMultipleReplays = async (replaysToRemove: FileResponse[]) => {
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
