import React from "react";
import { SidebarReplays } from "../components/home/SidebarReplays";
import { SidebarSettings } from "../components/home/SidebarSettings";
import { Viewer3D } from "../components/home/Viewer3D";

const Home = (): JSX.Element => {
    return (
        <>
            <SidebarReplays />
            <SidebarSettings />
            <Viewer3D />
        </>
    );
};

export default Home;
