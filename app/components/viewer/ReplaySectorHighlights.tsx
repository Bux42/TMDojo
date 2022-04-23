import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Sphere } from '@react-three/drei';
import { DoubleSide } from 'three';
import { ReplayData } from '../../lib/api/apiRequests';
import { getSampleNearTime } from '../../lib/utils/replay';

const SECTOR_INDICATOR_COLOR = new THREE.Color('white');

interface SectorIndicatorProps {
    position: THREE.Vector3;
}
const SectorIndicator = ({ position }: SectorIndicatorProps) => (
    <Sphere position={position} args={[2]}>
        <meshBasicMaterial attach="material" side={DoubleSide} color={SECTOR_INDICATOR_COLOR} />
    </Sphere>
);

interface ReplaySectorIndicatorProps {
    replay: ReplayData;
}
const ReplaySectorHighlights = ({ replay }: ReplaySectorIndicatorProps): JSX.Element => {
    const sectorIndicatorPositions = useMemo(() => {
        const positions = replay.sectorTimes?.map((sectorTime) => {
            const sample = getSampleNearTime(replay, sectorTime);
            return sample.position;
        });
        return positions;
    }, [replay]);

    return (
        <>
            {sectorIndicatorPositions?.map((pos, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <SectorIndicator key={`${replay._id}_${i}`} position={pos} />
            ))}
        </>
    );
};

export default ReplaySectorHighlights;
