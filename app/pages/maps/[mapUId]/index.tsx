import React, {
    useCallback, useEffect, useMemo, useState,
} from 'react';
import {
    Button, Checkbox, Layout, Modal, notification,
} from 'antd';
import { useRouter } from 'next/router';

import { ExclamationCircleOutlined, PieChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDetectGPU } from '@react-three/drei';
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
import SectorTimeTableButton from '../../../components/maps/SectorTimeTableButton';
import { filterReplaysWithValidSectorTimes } from '../../../lib/replays/sectorTimes';
import showPerformanceWarning from '../../../lib/popups/performanceWarning';

const Home = (): JSX.Element => {
    const [replays, setReplays] = useState<FileResponse[]>([]);
    const [loadingReplays, setLoadingReplays] = useState<boolean>(true);
    const [selectedReplayData, setSelectedReplayData] = useState<ReplayData[]>([]);
    const [mapData, setMapData] = useState<MapInfo>({});
    const [sectorTableVisible, setSectorTableVisible] = useState<boolean>(false);

    const [showViewer, setShowViewer] = useState<boolean>(true);

    const router = useRouter();
    const { mapUId } = router.query;

    const selectedReplaysWithValidSectors = useMemo(
        () => filterReplaysWithValidSectorTimes(selectedReplayData, replays),
        [selectedReplayData, replays],
    );

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

    const showPerformanceConfirmationModal = useCallback(() => {
        const stopShowingConfirmationModal = localStorage.getItem('stopShowingConfirmationModal') !== null;

        if (stopShowingConfirmationModal) {
            return;
        }

        setShowViewer(false);

        Modal.confirm({
            title: 'Potential performance issues!',
            content: (
                <div>
                    <p>Based on your detected hardware, your device might struggle with the 3D viewer's performance requirements.</p>
                    <br />
                    <p>One of the reasons could be that you do not have hardware acceleration enabled.</p>
                    <p>Please try enabling hardware acceleration in your browser settings and try again.</p>
                    <br />
                    <p>If you really want to continue anyway, press &apos;Continue&apos;.</p>
                    <br />
                    <Checkbox>Don&apos;t show again</Checkbox>
                </div>
            ),
            okText: 'Continue',
            cancelText: 'Back to homepage',
            centered: true,
            width: '600',
            icon: <ExclamationCircleOutlined style={{ color: '#a61d24' }} />,
            onOk: () => {
                setShowViewer(true);
            },
            onCancel: () => {
                router.push('/');
            },
        });
    }, [router]);

    const gpuTier = useDetectGPU();
    useEffect(() => {
        // Skip if GPU tier in not yet detected
        if (!gpuTier) return;

        // Handle less performant mobile devices differently
        if (gpuTier?.isMobile) return;

        if (gpuTier?.tier === 3) {
            // Don't show warning for users with a high-end GPU (>60 FPS)
        } else if (gpuTier?.tier === 2) {
            // Show performance warning when GPU tier is 2 (30 - 60 FPS)
            showPerformanceWarning();
        } else if (gpuTier?.tier <= 1) {
            // Disable 3D viewer for users with a low-end GPU (<30 FPS), show modal for confirmation to continue anyways
            showPerformanceConfirmationModal();
        }
    }, [gpuTier, showPerformanceConfirmationModal]);

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

    const onLoadReplay = async (replay: FileResponse) => {
        if (selectedReplayData.some((r) => r._id === replay._id)) {
            return;
        }
        const replayData = await fetchReplayData(replay);
        setSelectedReplayData([...selectedReplayData, replayData]);
    };

    const onRemoveReplay = async (replayToRemove: FileResponse) => {
        const replayDataFiltered = selectedReplayData.filter(
            (replay) => replay._id !== replayToRemove._id,
        );
        setSelectedReplayData(replayDataFiltered);
    };

    const onLoadAllVisibleReplays = async (
        allReplays: FileResponse[],
        selectedReplayDataIds: string[],
    ) => {
        const filtered = allReplays.filter(
            (replay) => selectedReplayDataIds.indexOf(replay._id) === -1,
        );
        const fetchedReplays = await Promise.all(
            filtered.map((replay) => fetchReplayData(replay)),
        );
        setSelectedReplayData([...selectedReplayData, ...fetchedReplays]);
    };

    const onRemoveAllReplays = async (replaysToRemove: FileResponse[]) => {
        const replayDataFiltered = selectedReplayData.filter((el) => replaysToRemove.includes(el));
        setSelectedReplayData(replayDataFiltered);
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
                        onRemoveReplay={onRemoveReplay}
                        onLoadAllVisibleReplays={onLoadAllVisibleReplays}
                        onRemoveAllReplays={onRemoveAllReplays}
                        selectedReplayDataIds={selectedReplayData.map((replay) => replay._id)}
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

                    <Button onClick={showPerformanceWarning}>Warning</Button>
                    <Button onClick={showPerformanceConfirmationModal}>Continue Confirm</Button>

                    {showViewer && (
                        <Viewer3D replaysData={selectedReplayData} />
                    )}
                </Layout.Content>
            </Layout>
        </>
    );
};

export default Home;
