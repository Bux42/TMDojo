import { Color } from 'highcharts';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { BufferGeometry } from 'three/src/Three';
import { ReplayData } from '../../lib/api/requests/replays';
import { ReplayDataPoint } from '../../lib/replays/replayData';

const NEARBY_SPHERE_RADIUS = 15;

interface SampleWithReplayId {
    replayId: string;
    sample: ReplayDataPoint;
}

const replayToSamples = (replay: ReplayData): SampleWithReplayId[] => replay.samples.map((sample) => (
    { replayId: replay._id, sample }
));

const calculateNearbySamples = (targetSamples: ReplayDataPoint[], allSamples: SampleWithReplayId[]) => {
    const returnArray: number[] = new Array(targetSamples.length).fill(0);

    for (let i = 0; i < targetSamples.length; i += 1) {
        const targetSample = targetSamples[i];
        // Filter all samples based on distance to target sample, with a maximum of 1 per replay
        const nearbySamples = allSamples.filter((sample) => (
            sample.sample.position.distanceTo(targetSample.position) < NEARBY_SPHERE_RADIUS
        ));
        const nearbyReplayIds = new Set(nearbySamples.map((sample) => sample.replayId));
        returnArray[i] = nearbyReplayIds.size;
    }

    return returnArray;
};

interface CrashDetectionProps {
    replays: ReplayData[];
}
const CrashDetection = ({
    replays,
}: CrashDetectionProps): JSX.Element => {
    const geomRefAllReplays = useRef<BufferGeometry>();
    const geomRefReplayToCheck = useRef<BufferGeometry>();

    const baseReplays = useMemo(() => replays.filter((_, i) => i !== replays.length - 1), [replays]);
    const replayToCheck = useMemo(() => (replays.length > 1 ? replays[replays.length - 1] : undefined), [replays]);

    const baseReplaySamples = useMemo(
        () => baseReplays.map((replayData) => replayToSamples(replayData)).flat(),
        [baseReplays],
    );
    const replayToCheckSamples = useMemo(() => {
        if (!replayToCheck) return [];
        return replayToSamples(replayToCheck);
    }, [replayToCheck]);

    // console.log({ baseReplaySamples });
    // console.log({ replayToCheckSamples });

    const baseReplaysPositions = useMemo(
        () => baseReplaySamples.map(({ sample }) => sample.position),
        [baseReplaySamples],
    );
    const replayToCheckPositions = useMemo(() => {
        if (!replayToCheckSamples) return [];
        return replayToCheckSamples.map(({ sample }) => sample.position);
    }, [replayToCheckSamples]);

    // console.log({ baseReplaysPoints, flat: baseReplaysPoints.flat() });
    // console.log({ replayToCheckPoints, flat: replayToCheckPoints.flat() });

    const nearbySamplesArray = useMemo(
        () => (replayToCheck ? calculateNearbySamples(replayToCheck.samples, baseReplaySamples) : []),
        [replayToCheck, baseReplaySamples],
    );

    useEffect(() => {
        if (!geomRefAllReplays.current) return;
        const geom = geomRefAllReplays.current;
        geom.setFromPoints(baseReplaysPositions);
    }, [geomRefAllReplays, baseReplaysPositions]);

    useEffect(() => {
        if (!geomRefReplayToCheck.current) return;
        const geom = geomRefReplayToCheck.current;
        geom.setFromPoints(replayToCheckPositions);
        let colorBuffer = geom.getAttribute('color');

        if (!colorBuffer || colorBuffer.count !== replayToCheckPositions.length) {
            colorBuffer = new THREE.BufferAttribute(
                new Float32Array(replayToCheckPositions.length * 4),
                4,
            );
        }

        for (let i = 0; i < replayToCheckPositions.length; i += 1) {
            const nearbySampleCalc = nearbySamplesArray[i];
            const factor = 1 - (nearbySampleCalc / baseReplays.length);
            colorBuffer.setXYZW(i,
                factor,
                0,
                0,
                factor);
        }

        geom.setAttribute('color', colorBuffer);
    }, [geomRefReplayToCheck, replayToCheckPositions, replayToCheckSamples, nearbySamplesArray, baseReplays]);

    return (
        <>
            <points>
                <bufferGeometry attach="geometry" ref={geomRefAllReplays} />
                <pointsMaterial size={1} color="green" side={THREE.DoubleSide} />
            </points>
            <points>
                <bufferGeometry attach="geometry" ref={geomRefReplayToCheck} />
                <pointsMaterial size={1} vertexColors />
            </points>
            {replayToCheckSamples.map((value, i) => {
                if (!geomRefReplayToCheck.current) return null;
                const colors = geomRefReplayToCheck.current.getAttribute('color');
                if (!colors) return null;
                const color = new THREE.Color(colors.getX(i), colors.getY(i), colors.getZ(i));
                const factor = colors.getW(i);
                return (
                    <>
                        {factor > 0.5 ? (
                            <>
                                <mesh position={value.sample.position}>
                                    <sphereGeometry args={[NEARBY_SPHERE_RADIUS, 10, 10]} />
                                    <meshBasicMaterial color={color} opacity={1} />
                                </mesh>
                                {/* <mesh position={value.sample.position}>
                                    <sphereGeometry args={[NEARBY_SPHERE_RADIUS, 4, 4]} />
                                    <meshBasicMaterial wireframe opacity={0.01} />
                                </mesh> */}
                            </>
                        ) : null}
                    </>
                );
            })}
            {/* <points>
                <bufferGeometry attach="geometry" setFromPoints={}>
                    <bufferAttribute
                        attachObject={['attributes', 'position']}
                        count={baseReplaysPoints.length}
                        array={new Float32Array(baseReplaysPoints.flat())}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.1} color="green" />
            </points> */}
            {/* <points>
                <bufferGeometry attach="geometry">
                    <bufferAttribute
                        attachObject={['attributes', 'position']}
                        count={replayToCheckPoints.length}
                        array={new Float32Array(replayToCheckPoints.flat())}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.02} color="red" />
            </points> */}
        </>
    );
};

export default CrashDetection;
