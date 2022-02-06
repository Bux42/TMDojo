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

const Home = (): JSX.Element => {
    const [replays, setReplays] = useState<FileResponse[]>([]);
    const [loadingReplays, setLoadingReplays] = useState<boolean>(true);
    const [selectedReplayData, setSelectedReplayData] = useState<ReplayData[]>([]);
    const [loadingReplayData, setLoadingReplayData] = useState<FileResponse[]>([]);
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

    const updateLoadingReplays = (
        replay: FileResponse,
        progressEvent: ProgressEvent,
        loadingReplayCopy: FileResponse[],
    ) => {
        const progressPercent = (progressEvent.loaded / progressEvent.total) * 100;

        const loadingReplay = loadingReplayCopy?.find((x) => x._id === replay._id);
        if (loadingReplay) {
            const index = loadingReplayCopy.indexOf(loadingReplay);
            loadingReplayCopy[index].downloadProgress = Math.round(progressPercent);
            setLoadingReplayData([...loadingReplayCopy]);
        }
    };

    const onLoadReplay = async (replay: FileResponse) => {
        const loadingReplayCopy = [...loadingReplayData, replay];
        setLoadingReplayData(loadingReplayCopy);

        const replayData = await fetchReplayData(replay, (progressEvent: ProgressEvent) => {
            updateLoadingReplays(replay, progressEvent, loadingReplayCopy);
        });

        const loadingReplayFiltered = loadingReplayData.filter(
            (loadingReplay) => loadingReplay._id !== replay._id,
        );

        setLoadingReplayData(loadingReplayFiltered);
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
        setLoadingReplayData(filtered);
        const fetchedReplays = await Promise.all(
            filtered.map((replay) => fetchReplayData(replay, (progressEvent) => {
                updateLoadingReplays(replay, progressEvent, filtered);
            })),
        );
        setLoadingReplayData([]);
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
                        loadingReplayData={loadingReplayData}
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
