import React, { useContext } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ReplayData } from "../../lib/api/fileRequests";
import { ReplayLines } from "./ReplayLines";
import { Grid } from "./Grid";
import { CameraController } from "./CameraController";
import { SettingsContext } from "../../lib/contexts/SettingsContext";

const BACKGROUND_COLOR = new THREE.Color(0.05, 0.05, 0.05);

interface Props {
    replaysData: ReplayData[];
}

export const Viewer3D = ({ replaysData }: Props): JSX.Element => {
    const { lineType } = useContext(SettingsContext);

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
                <color attach="background" args={[BACKGROUND_COLOR]} />
                <CameraController />
                <Grid replaysData={replaysData} blockPadding={2} />
                <ReplayLines replaysData={replaysData} lineType={lineType} />
            </Canvas>
        </div>
    );
};
