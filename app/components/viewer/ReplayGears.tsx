import React, { useMemo } from "react";
import * as THREE from "three";
import { Billboard, Sphere, Text } from "@react-three/drei";
import { ReplayData } from "../../lib/api/fileRequests";
import { ReplayDataPoint } from "../../lib/replays/replayData";
import { DoubleSide } from "three";

interface GearIndicatorProps {
    gearChange: GearChange;
}
const GearIndicator = ({ gearChange }: GearIndicatorProps) => {
    return (
        <Sphere position={gearChange.sample.position} args={[0.5]}>
            <meshBasicMaterial
                attach="material"
                side={DoubleSide}
                color={gearChange.gearUp ? "green" : "red"}
            />
        </Sphere>
    );
};

interface GearTextProps {
    gearChange: GearChange;
}
const GearText = ({ gearChange }: GearTextProps) => {
    return (
        <Billboard
            position={new THREE.Vector3().addVectors(
                gearChange.sample.position,
                new THREE.Vector3(0, 5, 0)
            )}
            args={[0, 0]}
        >
            <Text
                color={gearChange.gearUp ? "green" : "red"}
                fontSize={5}
                maxWidth={200}
                lineHeight={1}
                letterSpacing={0.02}
                textAlign={"left"}
                font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                anchorX="center"
                anchorY="middle"
            >
                <meshBasicMaterial attach="material" side={DoubleSide} color={"red"} />
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
export const ReplayGears = ({ replay }: ReplayGearsProps): JSX.Element => {
    const gearChanges = useMemo(() => {
        const gearChanges: GearChange[] = [];

        let prevSample: ReplayDataPoint | undefined = undefined;

        for (let i = 0; i < replay.samples.length; i++) {
            const curSample = replay.samples[i];

            if (i == 0) {
                // Gear change to 1 at the start of the replay
                gearChanges.push({
                    sample: curSample,
                    engineCurGear: curSample.engineCurGear,
                    gearUp: true,
                });
            } else if (prevSample != undefined) {
                if (curSample.engineCurGear != prevSample.engineCurGear) {
                    gearChanges.push({
                        sample: curSample,
                        engineCurGear: curSample.engineCurGear,
                        gearUp: curSample.engineCurGear > prevSample.engineCurGear,
                    });
                }
            }

            prevSample = curSample;
        }
        return gearChanges;
    }, [replay]);

    return (
        <>
            {gearChanges.map((gearChange, i) => (
                <>
                    <GearText key={`gears-text-${replay._id}-${i}`} gearChange={gearChange} />
                    <GearIndicator
                        key={`gears-indicator-${replay._id}-${i}`}
                        gearChange={gearChange}
                    />
                </>
            ))}
        </>
    );
};
