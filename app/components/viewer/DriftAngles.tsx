import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { ReplayData } from '../../lib/api/apiRequests';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';
import { getSampleNearTime } from '../../lib/utils/replay';

interface DriftAngleProps {
    replay: ReplayData;
    replayCarOpacity: number;
}

const DriftAngle = ({
    replay,
    replayCarOpacity,
}: DriftAngleProps) => {
    const triangleMeshRef = useRef<THREE.Mesh>();

    const trianglePoints: THREE.Vector3[] = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
    ];

    const f32array = Float32Array.from(
        new Array(trianglePoints.length)
            .fill(0)
            .flatMap((item, index) => trianglePoints[index].toArray()),
    );

    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    let curSample = replay.samples[0];

    useFrame((state, delta) => {
        curSample = getSampleNearTime(replay, timeLineGlobal.currentRaceTime);

        const velocityNorm = curSample.velocity.clone().normalize();

        if (Date.now() % 100 === 0) {
            // const angle = velocityNorm.angleTo(curSample.dir);

            // console.log('angle', angle, 'velocityNorm', velocityNorm, 'dir', curSample.dir);
        }
        if (triangleMeshRef.current) {
            const worldVelocity = curSample.position.clone().add(velocityNorm);
            const worldDir = curSample.position.clone().add(curSample.dir);

            trianglePoints[0].set(curSample.position.x, curSample.position.y, curSample.position.z);
            trianglePoints[1].set(worldVelocity.x, worldVelocity.y, worldVelocity.z);
            trianglePoints[2].set(worldDir.x, worldDir.y, worldDir.z);
            triangleMeshRef.current.geometry.setFromPoints(trianglePoints);
            triangleMeshRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <>
            <mesh ref={triangleMeshRef}>
                <bufferGeometry attach="geometry">
                    <bufferAttribute
                        needsUpdate
                        attachObject={['attributes', 'position']}
                        count={3}
                        itemSize={3}
                        array={f32array}
                    />
                </bufferGeometry>
                <meshBasicMaterial
                    attach="material"
                    color="white"
                    transparent
                    opacity={0.5}
                    wireframe={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </>
    );
};

interface DriftAnglesProps {
    replaysData: ReplayData[];
    replayCarOpacity: number;
}

const DriftAngles = ({
    replaysData,
    replayCarOpacity,
}: DriftAnglesProps): JSX.Element => (
    <>
        {replaysData.map((replay) => (
            <DriftAngle
                key={`replay-${replay._id}-car`}
                replay={replay}
                replayCarOpacity={replayCarOpacity}
            />
        ))}
    </>
);

export default DriftAngles;
