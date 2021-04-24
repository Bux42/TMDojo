import React, { useEffect, useState } from "react";
import { SidebarReplays } from "../components/home/SidebarReplays";
import { SidebarSettings } from "../components/home/SidebarSettings";
import { Viewer3D } from "../components/home/Viewer3D";
import { getFiles, FileResponse } from "../lib/api/fileRequests";

const Home = (): JSX.Element => {
    const [replays, setReplays] = useState<FileResponse[]>([]);

    useEffect(() => {
        const fetchAndSetReplays = async () => {
            const { Files } = await getFiles();
            setReplays(Files);
        };
        fetchAndSetReplays();
    }, []);

    const onLoadReplay = (replay: FileResponse) => {
        console.log("Loading replay: " + replay._id);
    };

    return (
        <>
            <SidebarReplays replays={replays} onLoadReplay={onLoadReplay} />
            <SidebarSettings />
            <Viewer3D />
        </>
    );
};

export default Home;
