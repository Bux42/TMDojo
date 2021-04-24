import React from "react";
import { Canvas } from "@react-three/fiber";
import { ReplayData } from "../../lib/api/fileRequests";
import { ReplayLines } from "./ReplayLines";
import { Grid } from "./Grid";
import { CameraController } from "./CameraController";

interface Props {
    replaysData: ReplayData[];
}

export const Viewer3D = ({ replaysData }: Props): JSX.Element => {
    return (
        <div style={{ zIndex: -10 }} className="w-screen h-screen">
            <Canvas
                camera={{
                    fov: 45,
                    position: [-800, 400, -800],
                    near: 0.1,
                    far: 50000,
                }}
            >
                <CameraController />
                <Grid />
                <ReplayLines replaysData={replaysData} />
            </Canvas>
        </div>
    );
};
