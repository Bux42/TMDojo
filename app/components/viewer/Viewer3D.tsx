import React, {
    Suspense, useContext, useEffect, useRef, useState,
} from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { ReplayData } from '../../lib/api/apiRequests';
import { ReplayLines } from './ReplayLines';
import { Grid, DEFAULT_GRID_POS } from './Grid';
import { SettingsContext } from '../../lib/contexts/SettingsContext';
import FrameRate from './FrameRate';
import ReplayCars from './ReplayCars';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';
import TimeLine from './timeline/TimeLine';
import SceneDirectionalLight from './SceneDirectionalLight';

const BACKGROUND_COLOR = new THREE.Color(0.05, 0.05, 0.05);

interface Props {
    replaysData: ReplayData[];
}
const Viewer3D = ({ replaysData }: Props): JSX.Element => {
    const {
        lineType,
        showGearChanges,
        showFPS,
        showInputOverlay,
        replayLineOpacity,
        replayCarOpacity,
    } = useContext(SettingsContext);

    const orbitControlsRef = useRef<any>();

    const [orbitTarget, setOrbitTarget] = useState<THREE.Vector3>(DEFAULT_GRID_POS);

    useEffect(() => {
        const timeLineGlobal = GlobalTimeLineInfos.getInstance();
        if (timeLineGlobal.currentRaceTime === 0 && replaysData.length === 1) {
            if (replaysData[0].samples.length > 0) {
                setOrbitTarget(replaysData[0].samples[0].position);
            }
        }
    }, [replaysData, setOrbitTarget]);

    return (
        <div style={{ zIndex: -10 }} className="w-full h-full">
            <Canvas
                camera={{
                    fov: 45,
                    position: [-800, 400, -800],
                    near: 0.1,
                    far: 50000,
                }}
                shadows
            >
                <ambientLight intensity={0.01} />
                <Sky distance={100000000} inclination={0} turbidity={0} rayleigh={10} />

                <SceneDirectionalLight replays={replaysData} />

                <OrbitControls
                    ref={orbitControlsRef}
                    dampingFactor={0.2}
                    rotateSpeed={0.4}
                    target={orbitTarget}
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
                        orbitControlsRef={orbitControlsRef}
                        showInputOverlay={showInputOverlay}
                        replayCarOpacity={replayCarOpacity}
                    />
                </Suspense>
                {showFPS && <FrameRate />}
            </Canvas>
            <TimeLine
                replaysData={replaysData}
            />
        </div>
    );
};

export default Viewer3D;
