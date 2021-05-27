import React, { useContext } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ReplayData } from "../../lib/api/apiRequests";
import { ReplayLines } from "./ReplayLines";
import { Grid, DEFAULT_GRID_POS } from "./Grid";
import { SettingsContext } from "../../lib/contexts/SettingsContext";
import { OrbitControls, Sky } from "@react-three/drei";

const BACKGROUND_COLOR = new THREE.Color(0.05, 0.05, 0.05);

interface Props {
    replaysData: ReplayData[];
}

export const Viewer3D = ({ replaysData }: Props): JSX.Element => {
    const { lineType, showGearChanges } = useContext(SettingsContext);

    return (
        <div style={{ zIndex: -10 }} className="w-full h-full">
            <Canvas
                camera={{
                    fov: 45,
                    position: [-800, 400, -800],
                    near: 0.1,
                    far: 50000,
                }}
            >
                <Sky distance={100000000} inclination={0} turbidity={0} rayleigh={10} />
                <OrbitControls dampingFactor={0.2} rotateSpeed={0.4} target={DEFAULT_GRID_POS} />

                <Grid replaysData={replaysData} blockPadding={2} />
                <ReplayLines
                    replaysData={replaysData}
                    lineType={lineType}
                    showGearChanges={showGearChanges}
                />
            </Canvas>
        </div>
    );
};
