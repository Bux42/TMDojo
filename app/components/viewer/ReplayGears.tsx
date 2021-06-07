import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Billboard, Sphere, Text } from '@react-three/drei';
import { DoubleSide } from 'three';
import { ReplayData } from '../../lib/api/apiRequests';
import { ReplayDataPoint } from '../../lib/replays/replayData';
import { getColorFromMap } from '../../lib/utils/colormaps';
import { COLOR_MAP_GEARS } from '../../lib/replays/replayLineColors';

interface GearIndicatorProps {
    gearChange: GearChange;
}
const GearIndicator = ({ gearChange }: GearIndicatorProps) => {
    const color = getColorFromMap(gearChange.engineCurGear, COLOR_MAP_GEARS);

    return (
        <Sphere position={gearChange.sample.position} args={[0.5]}>
            <meshBasicMaterial attach="material" side={DoubleSide} color={color} />
        </Sphere>
    );
};

interface GearTextProps {
    gearChange: GearChange;
}
const GearText = ({ gearChange }: GearTextProps) => {
    const color = getColorFromMap(gearChange.engineCurGear, COLOR_MAP_GEARS);

    return (
        <Billboard
            position={new THREE.Vector3().addVectors(
                gearChange.sample.position,
                new THREE.Vector3(0, 5, 0),
            )}
            args={[0, 0]}
        >
            <Text
                color={color}
                fontSize={5}
                maxWidth={200}
                lineHeight={1}
                letterSpacing={0.02}
                textAlign="left"
                font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                anchorX="center"
                anchorY="middle"
            >
                <meshBasicMaterial attach="material" side={DoubleSide} color="red" />
                {gearChange.engineCurGear}
            </Text>
        </Billboard>
    );
};

interface GearChange {
    sample: ReplayDataPoint;
    engineCurGear: number;
    gearUp: boolean;
}

interface ReplayGearsProps {
    replay: ReplayData;
}
const ReplayGears = ({ replay }: ReplayGearsProps): JSX.Element => {
    const gearChanges = useMemo(() => {
        const changes: GearChange[] = [];

        let prevSample: ReplayDataPoint | undefined;

        for (let i = 0; i < replay.samples.length; i++) {
            const curSample = replay.samples[i];

            if (i === 0) {
                // Gear change to 1 at the start of the replay
                changes.push({
                    sample: curSample,
                    engineCurGear: curSample.engineCurGear,
                    gearUp: true,
                });
            } else if (prevSample !== undefined) {
                if (curSample.engineCurGear !== prevSample.engineCurGear) {
                    changes.push({
                        sample: curSample,
                        engineCurGear: curSample.engineCurGear,
                        gearUp: curSample.engineCurGear > prevSample.engineCurGear,
                    });
                }
            }

            prevSample = curSample;
        }
        return changes;
    }, [replay]);

    return (
        <>
            {gearChanges.map((gearChange) => (
                <>
                    <GearText
                        key={`gears-text-${replay._id}-${gearChange.sample.currentRaceTime}`}
                        gearChange={gearChange}
                    />
                    <GearIndicator
                        key={`gears-indicator-${replay._id}-${gearChange.sample.currentRaceTime}`}
                        gearChange={gearChange}
                    />
                </>
            ))}
        </>
    );
};

export default ReplayGears;
