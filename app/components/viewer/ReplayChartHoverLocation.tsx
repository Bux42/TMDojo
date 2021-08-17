import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import { DoubleSide } from 'three';
import * as THREE from 'three';
import { ReplayData } from '../../lib/api/apiRequests';
import { GlobalChartsData } from '../maps/SidebarCharts';
import getSampleNearTime from '../../lib/utils/replay';

interface ReplayChartHoverLocationProps {
    replay: ReplayData;
    globalChartsData: GlobalChartsData;
}
const ReplayChartHoverLocation = ({
    replay, globalChartsData,
}: ReplayChartHoverLocationProps) => {
    const sphereRef = useRef<THREE.Mesh>();

    useFrame(() => {
        if (sphereRef.current) {
            if (globalChartsData.hoveredRaceTime !== undefined) {
                const curSample = getSampleNearTime(replay, globalChartsData.hoveredRaceTime);

                sphereRef.current.position.lerp(curSample.position, 0.8);
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
