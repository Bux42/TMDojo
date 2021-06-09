import React, { useContext } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { ReplayData } from '../../lib/api/apiRequests';
import { ReplayLines } from './ReplayLines';
import { Grid, DEFAULT_GRID_POS } from './Grid';
import { SettingsContext } from '../../lib/contexts/SettingsContext';
import { GraphContext } from '../../lib/contexts/GraphContext';

interface Props {
    replaysData: ReplayData[];
}

const Viewer3D = ({ replaysData }: Props): JSX.Element => {
    const { lineType, showGearChanges } = useContext(SettingsContext);
    const { range } = useContext(GraphContext);

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
                    range={range}
                />
            </Canvas>
        </div>
    );
};

export default Viewer3D;
