import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Sphere } from '@react-three/drei';
import { DoubleSide } from 'three';
import { ReplayData } from '../../lib/api/requests/replays';
import { getSampleNearTime } from '../../lib/utils/replay';
import { setInterpolatedVector } from '../../lib/utils/math';

const SECTOR_INDICATOR_COLOR = new THREE.Color('white');

interface SectorIndicatorProps {
    position: THREE.Vector3;
    color?: THREE.Color;
}
const SectorIndicator = ({ position, color }: SectorIndicatorProps) => (
    <Sphere position={position} args={[2]}>
        <meshBasicMaterial attach="material" side={DoubleSide} color={color || SECTOR_INDICATOR_COLOR} />
    </Sphere>
);

interface ReplaySectorIndicatorProps {
    replay: ReplayData;
}
const ReplaySectorHighlights = ({ replay }: ReplaySectorIndicatorProps): JSX.Element => {
    const interpolatedPositions = useMemo(() => {
        const positions = replay.sectorTimes?.map((sectorTime) => {
            const sample = getSampleNearTime(replay, sectorTime);
            const prevSample = replay.samples[replay.samples.indexOf(sample) - 1];

            const factor: number = (sectorTime - prevSample.currentRaceTime)
                / (sample.currentRaceTime - prevSample.currentRaceTime);

            const interpolatedPosition = new THREE.Vector3();
            setInterpolatedVector(interpolatedPosition, prevSample.position, sample.position, factor);

            return interpolatedPosition;
        });
        return positions;
    }, [replay]);

    const sectorIndicatorPositions = useMemo(() => {
        const positions = replay.sectorTimes?.map((sectorTime) => {
            const sample = getSampleNearTime(replay, sectorTime);
            return sample.position;
        });
        return positions;
    }, [replay]);

    const prevIndicatorPositions = useMemo(() => {
        const positions = replay.sectorTimes?.map((sectorTime) => {
            const sample = getSampleNearTime(replay, sectorTime);
            const prevSample = replay.samples[replay.samples.indexOf(sample) - 1];
            return prevSample.position;
        });
        return positions;
    }, [replay]);

    return (
        <>
            {sectorIndicatorPositions?.map((pos, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <SectorIndicator key={`${replay._id}_${i}`} position={pos} />
            ))}
            {interpolatedPositions?.map((pos, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <SectorIndicator key={`${replay._id}_${i}`} position={pos} color={new THREE.Color(1, 0, 0)} />
            ))}
            {prevIndicatorPositions?.map((pos, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <SectorIndicator key={`${replay._id}_${i}`} position={pos} color={new THREE.Color(0, 1, 0)} />
            ))}
        </>
    );
};

export default ReplaySectorHighlights;
