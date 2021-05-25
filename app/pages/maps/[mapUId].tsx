import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Layout } from "antd";
import { useRouter } from "next/router";

import { SidebarReplays } from "../../components/maps/SidebarReplays";
import { SidebarSettings } from "../../components/maps/SidebarSettings";
import { MapHeader } from "../../components/maps/MapHeader";
import { Viewer3D } from "../../components/viewer/Viewer3D";
import {
    getReplays,
    getMapInfo,
    FileResponse,
    fetchReplayData,
    ReplayData,
    MapInfo,
} from "../../lib/api/apiRequests";
import { HeadTitle } from "../../components/common/HeadTitle";

const Home = (): JSX.Element => {
    const [replays, setReplays] = useState<FileResponse[]>([]);
    const [selectedReplayData, setSelectedReplayData] = useState<ReplayData[]>([]);
    const [mapData, setMapData] = useState<MapInfo>({});

    const router = useRouter();
    const { mapUId } = router.query;

    const fetchAndSetReplays = async () => {
        const { files } = await getReplays({ mapUId: `${mapUId}` });
        setReplays(files);
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
        const replayData = await fetchReplayData(replay);
        setSelectedReplayData([...selectedReplayData, replayData]);
    };

    const onRemoveReplay = async (replayToRemove: FileResponse) => {
        const replayDataFiltered = selectedReplayData.filter(
            (replay) => replay._id != replayToRemove._id
        );
        setSelectedReplayData(replayDataFiltered);
    };

    const onLoadAllVisibleReplays = async (
        replays: FileResponse[],
        selectedReplayDataIds: string[]
    ) => {
        const filtered = replays.filter(
            (replay) => selectedReplayDataIds.indexOf(replay._id) == -1
        );
        const fetchedReplays = await Promise.all(
            filtered.map((replay) => {
                return fetchReplayData(replay);
            })
        );
        setSelectedReplayData([...selectedReplayData, ...fetchedReplays]);
    };

    const onRemoveAllReplays = async (replaysToRemove: FileResponse[]) => {
        const replayDataFiltered = selectedReplayData.filter((el) => {
            return replaysToRemove.includes(el);
        });
        setSelectedReplayData(replayDataFiltered);
    };

    return (
        <>
            <HeadTitle mapInfo={mapData} />
            <Layout>
                <MapHeader mapInfo={mapData} />
                <Layout.Content>
                    <SidebarReplays
                        mapUId={`${mapUId}`}
                        replays={replays}
                        onLoadReplay={onLoadReplay}
                        onRemoveReplay={onRemoveReplay}
                        onLoadAllVisibleReplays={onLoadAllVisibleReplays}
                        onRemoveAllReplays={onRemoveAllReplays}
                        selectedReplayDataIds={selectedReplayData.map((replay) => replay._id)}
                        onRefreshReplays={fetchAndSetReplays}
                    />
                    <SidebarSettings />
                    <Viewer3D replaysData={selectedReplayData} />
                </Layout.Content>
            </Layout>
        </>
    );
};

export default Home;
