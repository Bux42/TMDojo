import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import { DoubleSide } from 'three';
import * as THREE from 'three';
import { ReplayData } from '../../lib/api/requests/replays';
import { getSampleNearTime } from '../../lib/utils/replay';
import GlobalChartsDataSingleton from '../../lib/singletons/globalChartData';

interface ReplayChartHoverLocationProps {
    replay: ReplayData;
}
const ReplayChartHoverLocation = ({
    replay,
}: ReplayChartHoverLocationProps) => {
    const sphereRef = useRef<THREE.Mesh>();

    const globalChartsData = GlobalChartsDataSingleton.getInstance();

    useFrame(() => {
        if (sphereRef.current) {
            if (globalChartsData.hoveredRaceTime !== undefined) {
                const curSample = getSampleNearTime(replay, globalChartsData.hoveredRaceTime);

                sphereRef.current.position.set(curSample.position.x, curSample.position.y, curSample.position.z);
                sphereRef.current.scale.set(0.5, 0.5, 0.5);
            } else {
                sphereRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
            }
        }
    });

    return globalChartsData.hoveredRaceTime === undefined
        ? (
            <Sphere ref={sphereRef} args={[0.5]}>
                <meshBasicMaterial attach="material" side={DoubleSide} color={replay.color} />
            </Sphere>
        )
        : null;
};

export default ReplayChartHoverLocation;
