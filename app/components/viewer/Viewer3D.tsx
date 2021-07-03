import React, { Suspense, useContext, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { ReplayData } from '../../lib/api/apiRequests';
import { ReplayLines } from './ReplayLines';
import { TimeLine, TimeLineInfos } from './TimeLine';
import { Grid, DEFAULT_GRID_POS } from './Grid';
import { SettingsContext } from '../../lib/contexts/SettingsContext';
import FrameRate from './FrameRate';
import ReplayCars from './ReplayCars';

const BACKGROUND_COLOR = new THREE.Color(0.05, 0.05, 0.05);

interface Props {
    replaysData: ReplayData[];
}

const timeLineGlobal = new TimeLineInfos();

const Viewer3D = ({ replaysData }: Props): JSX.Element => {
    const {
        lineType,
        showGearChanges,
        showFPS,
        showInputOverlay,
        replayLineOpacity,
        replayCarOpacity,
        cameraMode,
    } = useContext(SettingsContext);
    const orbitControlsRef = useRef<any>();

    let orbitDefaultTarget = DEFAULT_GRID_POS;
    if (timeLineGlobal.currentRaceTime === 0 && replaysData.length > 0) {
        orbitDefaultTarget = replaysData[0].samples[0].position;
    }

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
                <ambientLight />
                <pointLight position={[10, 10, 10]} power={1} />
                <Sky distance={100000000} inclination={0} turbidity={0} rayleigh={10} />
                <OrbitControls
                    ref={orbitControlsRef}
                    dampingFactor={0.2}
                    rotateSpeed={0.4}
                    target={orbitDefaultTarget}
                />

                <Grid replaysData={replaysData} blockPadding={2} />
                <ReplayLines
                    replaysData={replaysData}
                    lineType={lineType}
                    replayLineOpacity={replayLineOpacity}
                    showGearChanges={showGearChanges}
                />
                <Suspense fallback={null}>
                    <ReplayCars
                        replaysData={replaysData}
                        timeLineGlobal={timeLineGlobal}
                        orbitControlsRef={orbitControlsRef}
                        showInputOverlay={showInputOverlay}
                        replayCarOpacity={replayCarOpacity}
                        cameraMode={cameraMode}
                    />
                </Suspense>
                {showFPS && <FrameRate />}
            </Canvas>
            <TimeLine
                replaysData={replaysData}
                timeLineGlobal={timeLineGlobal}
            />
        </div>
    );
};

export default Viewer3D;
