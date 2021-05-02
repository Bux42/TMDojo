import React, { useEffect, useState } from "react";
import { Layout } from "antd";

import { SidebarReplays } from "../components/home/SidebarReplays";
import { SidebarSettings } from "../components/home/SidebarSettings";
import { MapHeader } from "../components/home/MapHeader";
import { Viewer3D } from "../components/viewer/Viewer3D";
import { getFiles, FileResponse, fetchReplayData, ReplayData } from "../lib/api/fileRequests";

const Home = (): JSX.Element => {
    const [replays, setReplays] = useState<FileResponse[]>([]);
    const [selectedReplayData, setSelectedReplayData] = useState<ReplayData[]>([]);

    useEffect(() => {
        const fetchAndSetReplays = async () => {
            const { Files } = await getFiles();
            setReplays(Files);
        };
        fetchAndSetReplays();
    }, []);

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

    const onLoadAllVisibleReplays = async (replays: FileResponse[], selectedReplayDataIds: string[]) => {
        const fetchedReplays = [];
        for (let i = 0; i < replays.length; i++) {
            if (selectedReplayDataIds.indexOf(replays[i]._id) == -1) {
                const replayData = await fetchReplayData(replays[i]);
                fetchedReplays.push(replayData);
            }
        }
        setSelectedReplayData([...selectedReplayData, ...fetchedReplays]);
    }

    const onRemoveAllReplays = async (replaysToRemove: FileResponse[]) => {
        const replayDataFiltered = selectedReplayData.filter(function (el) {
            return replaysToRemove.includes(el);
        });
        setSelectedReplayData(replayDataFiltered);
    };

    return (
        <Layout>
            {/* TODO: enable this when we have a mapUId available
                <MapHeader mapUId="h_1dfEJJ8m7eY0jB6Ka7XWof6w" /> 
            */}
            <Layout.Content>
                <SidebarReplays
                    replays={replays}
                    onLoadReplay={onLoadReplay}
                    onRemoveReplay={onRemoveReplay}
                    onLoadAllVisibleReplays={onLoadAllVisibleReplays}
                    onRemoveAllReplays={onRemoveAllReplays}
                    selectedReplayDataIds={selectedReplayData.map((replay) => replay._id)}
                />
                <SidebarSettings />
                <Viewer3D replaysData={selectedReplayData} />
            </Layout.Content>
        </Layout>
    );
};

export default Home;
