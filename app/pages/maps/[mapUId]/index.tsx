import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { useRouter } from 'next/router';

import { useQueryClient } from 'react-query';
import SidebarReplays from '../../../components/maps/SidebarReplays';
import SidebarSettings from '../../../components/maps/SidebarSettings';
import MapHeader from '../../../components/maps/MapHeader';
import Viewer3D from '../../../components/viewer/Viewer3D';
import HeadTitle from '../../../components/common/HeadTitle';
import { ChartsDrawer } from '../../../components/maps/ChartsDrawer';
import { cleanTMFormatting } from '../../../lib/utils/formatting';
import LoadedReplays from '../../../components/maps/LoadedReplays';
import api from '../../../lib/api/apiWrapper';
import { ReplayInfo, ReplayData } from '../../../lib/api/requests/replays';
import { MapInfo } from '../../../lib/api/requests/maps';
import useMapReplays from '../../../lib/api/hooks/query/replays';
import QUERY_KEYS from '../../../lib/utils/reactQuery/reactQueryKeys';

const Home = (): JSX.Element => {
    const [selectedReplayData, setSelectedReplayData] = useState<ReplayData[]>([]);
    const [mapData, setMapData] = useState<MapInfo>({});

    const router = useRouter();
    const { mapUId } = router.query;

    const queryClient = useQueryClient();
    const {
        data: replays,
        isLoading: isLoadingReplays,
    } = useMapReplays(typeof mapUId === 'string' ? mapUId : undefined);

    useEffect(() => {
        const fetchMapData = async (mapId: string) => {
            const mapInfo = await api.maps.getMapInfo(mapId); // TODO: what happens if the map can't be found?
            setMapData(mapInfo);
        };
        if (mapUId !== undefined) {
            fetchMapData(`${mapUId}`);
        }
    }, [mapUId]);

    const onLoadReplay = async (replay: ReplayInfo) => {
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

    const getTitle = () => (mapData?.name ? `${cleanTMFormatting(mapData.name)} - TMDojo` : 'TMDojo');

    return (
        <>
            <HeadTitle title={getTitle()} />
            <Layout>
                <MapHeader mapInfo={mapData} title="Replay viewer" />
                <Layout.Content>
                    <SidebarReplays
                        mapUId={`${mapUId}`}
                        replays={replays?.replays || []}
                        loadingReplays={isLoadingReplays}
                        onLoadReplay={onLoadReplay}
                        onRemoveReplay={onRemoveReplay}
                        onLoadAllVisibleReplays={onLoadAllVisibleReplays}
                        onRemoveAllReplays={onRemoveAllReplays}
                        selectedReplayDataIds={selectedReplayData.map((replay) => replay._id)}
                        onRefreshReplays={() => queryClient.invalidateQueries(QUERY_KEYS.mapReplays(mapUId as string))}
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
