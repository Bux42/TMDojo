import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Modal } from 'antd';
import { useRouter } from 'next/router';

import { useQueryClient } from 'react-query';
import { PieChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
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
import api from '../../../lib/api/apiWrapper';
import { ReplayInfo, ReplayData } from '../../../lib/api/requests/replays';
import useMapReplays from '../../../lib/api/hooks/query/replays';
import QUERY_KEYS from '../../../lib/utils/reactQuery/reactQueryKeys';
import { useMapInfo } from '../../../lib/api/hooks/query/maps';
import useIsMobileDevice from '../../../lib/hooks/useIsMobileDevice';
import { filterReplaysWithValidSectorTimes } from '../../../lib/replays/sectorTimes';

const Home = (): JSX.Element => {
    const queryClient = useQueryClient();

    const router = useRouter();
    const { mapUId: rawMapUId } = router.query;
    const mapUId = useMemo(() => (typeof rawMapUId === 'string' ? rawMapUId : undefined), [rawMapUId]);

    const {
        data: mapReplaysResult,
        isLoading: isLoadingReplays,
    } = useMapReplays(mapUId);

    const { data: mapInfo } = useMapInfo(mapUId);

    const [selectedReplayData, setSelectedReplayData] = useState<ReplayData[]>([]);
    const [sectorTableVisible, setSectorTableVisible] = useState<boolean>(false);

    const isMobile = useIsMobileDevice();

    const selectedReplaysWithValidSectors = useMemo(
        () => filterReplaysWithValidSectorTimes(selectedReplayData, mapReplaysResult?.replays || []),
        [mapReplaysResult?.replays, selectedReplayData],
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

    const onLoadReplay = async (replay: ReplayInfo) => {
        if (selectedReplayData.some((r) => r._id === replay._id)) {
            return;
        }
        const replayData = await api.replays.fetchReplayData(replay);

        setSelectedReplayData([...selectedReplayData, replayData]);
    };

    const onRemoveReplay = async (replayToRemove: ReplayInfo) => {
        const replayDataFiltered = selectedReplayData.filter(
            (replay) => replay._id !== replayToRemove._id,
        );
        setSelectedReplayData(replayDataFiltered);
    };

    const onLoadAllVisibleReplays = async (
        allReplays: ReplayInfo[],
        selectedReplayDataIds: string[],
    ) => {
        const filtered = allReplays.filter(
            (replay) => selectedReplayDataIds.indexOf(replay._id) === -1,
        );
        const fetchedReplays = await Promise.all(
            filtered.map((replay) => api.replays.fetchReplayData(replay)),
        );
        setSelectedReplayData([...selectedReplayData, ...fetchedReplays]);
    };

    const onRemoveAllReplays = async (replaysToRemove: ReplayInfo[]) => {
        const replayDataFiltered = selectedReplayData.filter((el) => replaysToRemove.includes(el));
        setSelectedReplayData(replayDataFiltered);
    };

    const title = mapInfo?.name
        ? `${cleanTMFormatting(mapInfo.name)} - TMDojo`
        : 'TMDojo';

    return (
        <>
            <HeadTitle title={title} />
            <Layout>
                <MapHeader mapInfo={mapInfo} title="Replay viewer" backUrl="/">
                    <CleanButton
                        url={`/maps/${mapInfo?.mapUid}/stats`}
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
                        onLoadReplay={onLoadReplay}
                        onRemoveReplay={onRemoveReplay}
                        onLoadAllVisibleReplays={onLoadAllVisibleReplays}
                        onRemoveAllReplays={onRemoveAllReplays}
                        selectedReplayDataIds={selectedReplayData.map((replay) => replay._id)}
                        onRefreshReplays={() => queryClient.invalidateQueries(QUERY_KEYS.mapReplays(mapUId as string))}
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
