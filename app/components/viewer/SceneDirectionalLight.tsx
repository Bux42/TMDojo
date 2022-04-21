import React, { useCallback, useEffect, useRef } from 'react';
import {
    Color, DirectionalLight, Group, Vector3,
} from 'three';
import { Sphere } from '@react-three/drei';
import { ReplayData } from '../../lib/api/apiRequests';

interface SceneDirectionalLightProps {
    replays: ReplayData[];
    castShadow?: boolean;
    intensity: number;
    showDebugLocation?: boolean;
    corner?: number;
}
const SceneDirectionalLight = ({
    replays,
    castShadow,
    intensity,
    showDebugLocation = false,
    corner = 0,
}: SceneDirectionalLightProps) => {
    const ref = useRef<DirectionalLight>();
    const targetRef = useRef<Group>();

    const calcMinMidMaxPositions = useCallback((replays_) => {
        let minPos = new Vector3(Infinity, Infinity, Infinity);
        let maxPos = new Vector3(-Infinity, -Infinity, -Infinity);

        for (let i = 0; i < replays_.length; i += 1) {
            const replay = replays_[i];
            minPos = minPos.min(replay.minPos);
            maxPos = maxPos.max(replay.maxPos);
        }

        const midPos = new Vector3()
            .addScaledVector(minPos, 0.5)
            .addScaledVector(maxPos, 0.5);

        return { minPos, midPos, maxPos };
    }, []);

    const setLightTarget = (x: number, y: number, z: number) => {
        if (ref.current) {
            ref.current.target.position.set(x, y, z);
            ref.current.target.updateMatrixWorld();
        }
    };

    useEffect(() => {
        if (ref.current && replays.length > 0) {
            const { minPos, midPos, maxPos } = calcMinMidMaxPositions(replays);

            const minXZ = Math.min(minPos.x, minPos.z);
            const maxXZ = Math.max(maxPos.x, maxPos.z);

            // X on corners 0 and 3: xz min; X on corners 1 and 2: xz max
            const x = (corner + 1) % 4 <= 1 ? minXZ : maxXZ;
            // Z on corners 0 and 1: xz min; Z on corners 2 and 3: xz max
            const z = corner % 4 < 2 ? minXZ : maxXZ;

            ref.current.position.set(
                x,
                maxPos.y + (maxXZ - minXZ) * 0.25,
                z,
            );
            setLightTarget(midPos.x, minPos.y, midPos.z);

            if (targetRef.current) {
                targetRef.current.position.set(
                    ref.current.target.position.x,
                    ref.current.target.position.y,
                    ref.current.target.position.z,
                );
            }
        }
    }, [ref, targetRef, replays, calcMinMidMaxPositions, corner]);

    return (
        <>
            <directionalLight
                ref={ref}
                intensity={intensity}
                castShadow={castShadow}
                shadow-bias={-0.0005}
                shadow-mapSize-width={4096}
                shadow-mapSize-height={4096}
                shadow-camera-near={1}
                shadow-camera-far={50000}
                shadow-camera-left={-750}
                shadow-camera-right={750}
                shadow-camera-top={750}
                shadow-camera-bottom={-750}
            >
                {/* Debug Location */}
                {showDebugLocation && (
                    <Sphere args={[8, 8, 8]}>
                        <meshStandardMaterial attach="material" color={new Color('yellow')} />
                    </Sphere>
                )}
            </directionalLight>

            {/* Debug Target Location */}
            {showDebugLocation && (
                <group ref={targetRef}>
                    <Sphere args={[8, 8, 8]} castShadow>
                        <meshStandardMaterial attach="material" color={new Color('red')} />
                    </Sphere>
                </group>
            )}
        </>
    );
};

export default SceneDirectionalLight;
