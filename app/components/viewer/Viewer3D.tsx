import React, {
    Suspense, useContext, useEffect, useRef, useState,
} from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { message } from 'antd';
import { ReplayData } from '../../lib/api/apiRequests';
import { ReplayLines } from './ReplayLines';
import { Grid, DEFAULT_GRID_POS } from './Grid';
import { SettingsContext } from '../../lib/contexts/SettingsContext';
import FrameRate from './FrameRate';
import ReplayCars from './ReplayCars';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';
import TimeLine from './TimeLine';
import fetchMapBlocks from '../../lib/api/mapRequests';
import { MapBlockData } from '../../lib/blocks/blockData';
import MapBlocks from './MapBlocks';

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
        cameraMode,
        numColorChange,
        showBlocks,
    } = useContext(SettingsContext);

    const [mapBlockData, setMapBlockData] = useState<MapBlockData | undefined>();

    const orbitControlsRef = useRef<any>();
    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    let orbitDefaultTarget = DEFAULT_GRID_POS;
    if (timeLineGlobal.currentRaceTime === 0 && replaysData.length > 0) {
        if (replaysData[0].samples.length) {
            orbitDefaultTarget = replaysData[0].samples[0].position;
        }
    }

    useEffect(() => {
        const f = async () => {
            try {
                const blocks = await fetchMapBlocks(replaysData[0]);
                setMapBlockData(blocks);
            } catch (e) {
                // TODO: Either store that this map is unavailable, or just do nothing, like now
                if (showBlocks) {
                    message.error('Could not retrieve map blocks...');
                }
            }
        };
        f();
    }, [replaysData]);

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
                        orbitControlsRef={orbitControlsRef}
                        showInputOverlay={showInputOverlay}
                        replayCarOpacity={replayCarOpacity}
                        cameraMode={cameraMode}
                    />
                </Suspense>
                {showFPS && <FrameRate />}
                {showBlocks && mapBlockData && <MapBlocks mapBlockData={mapBlockData} />}
            </Canvas>
            <TimeLine
                replaysData={replaysData}
            />
        </div>
    );
};

export default Viewer3D;
