import {
    useFrame, useThree, Camera,
} from '@react-three/fiber';
import * as THREE from 'three';
import React, {
    useRef, useState,
} from 'react';
import { useFBX } from '@react-three/drei';
import { ReplayData } from '../../lib/api/apiRequests';
import { ReplayDataPoint } from '../../lib/replays/replayData';
import vecToQuat from '../../lib/utils/math';
import { CameraMode } from '../../lib/contexts/SettingsContext';
import InputOverlay from './InputOverlay';
import {
    getSampleNearTime, interpolateSamples,
} from '../../lib/utils/replay';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';

const BACK_WHEEL_Y = 35.232017517089844;
const FRONT_WHEEL_Y = 35.24349594116211;

interface ReplayCarProps {
    replay: ReplayData;
    camera: Camera;
    orbitControlsRef: any;
    showInputOverlay: boolean;
    fbx: THREE.Object3D;
    replayCarOpacity: number;
}

const ReplayCar = ({
    replay, camera, orbitControlsRef, showInputOverlay, fbx, replayCarOpacity,
}: ReplayCarProps) => {
    const mesh = useRef<THREE.Mesh>();
    const stadiumCarMesh = useRef<THREE.Mesh>();
    const camPosRef = useRef<THREE.Mesh>();

    const currentSampleRef = useRef<ReplayDataPoint>(replay.samples[0]);
    const prevSampleRef = useRef<ReplayDataPoint>(replay.samples[0]);

    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    const smoothSample: ReplayDataPoint = {
        ...replay.samples[0],
        // Clone all Vector3 fields to avoid modifying original sample
        position: replay.samples[0].position.clone(),
        velocity: replay.samples[0].velocity.clone(),
        up: replay.samples[0].up.clone(),
        dir: replay.samples[0].dir.clone(),
    };

    // Get own material from loaded car model
    const carMesh: THREE.Mesh = fbx.children[0] as THREE.Mesh;
    const material: THREE.MeshPhongMaterial = carMesh.material as THREE.MeshPhongMaterial;
    const matClone = material.clone();
    matClone.opacity = replayCarOpacity;
    matClone.color = new THREE.Color(
        replay.color.r,
        replay.color.g,
        replay.color.b,
    );

    fbx.children.forEach((child: any) => {
        child.material = matClone;
    });
    fbx.traverse((children: THREE.Object3D) => {
        if (children instanceof THREE.Mesh) {
            children.castShadow = true;
        }
    });

    useFrame((state, delta) => {
        timeLineGlobal.tickTime = delta * 1000;
        if (mesh.current
            && camPosRef.current) {
            const followed = timeLineGlobal.followedReplay != null && timeLineGlobal.followedReplay._id === replay._id;
            const hovered = timeLineGlobal.hoveredReplay != null && timeLineGlobal.hoveredReplay._id === replay._id;

            // Get closest sample to TimeLine.currentRaceTime
            const curSample = getSampleNearTime(replay, timeLineGlobal.currentRaceTime);

            currentSampleRef.current = curSample;
            prevSampleRef.current = replay.samples[replay.samples.indexOf(curSample) - 1];

            if (timeLineGlobal.currentRaceTime < replay.endRaceTime) {
                interpolateSamples(prevSampleRef.current, curSample, smoothSample, timeLineGlobal.currentRaceTime);
            } else {
                interpolateSamples(prevSampleRef.current, curSample, smoothSample, curSample.currentRaceTime);
            }

            // Get car rotation
            const carRotation: THREE.Quaternion = vecToQuat(
                smoothSample.dir,
                smoothSample.up,
            );

            // Move & rotate 3D car from current sample rot & pos
            mesh.current.position.set(smoothSample.position.x, smoothSample.position.y, smoothSample.position.z);

            if (stadiumCarMesh.current) {
                stadiumCarMesh.current.rotation.setFromQuaternion(carRotation);

                // Set front wheels rotation
                const rearLeftWheel = stadiumCarMesh.current.children[3];
                const frontLeftWheel = stadiumCarMesh.current.children[2];
                const rearRightWheel = stadiumCarMesh.current.children[1];
                const frontRigthWheel = stadiumCarMesh.current.children[4];

                frontLeftWheel.rotation.y = smoothSample.wheelAngle; // FL
                frontRigthWheel.rotation.y = smoothSample.wheelAngle; // FR

                // Set wheel suspensions
                rearRightWheel.position.setY(BACK_WHEEL_Y - (smoothSample.rRDamperLen * 100)); // RR
                frontLeftWheel.position.setY(FRONT_WHEEL_Y - (smoothSample.fLDamperLen * 100)); // FL
                rearLeftWheel.position.setY(BACK_WHEEL_Y - (smoothSample.rLDamperLen * 100)); // RL
                frontRigthWheel.position.setY(FRONT_WHEEL_Y - (smoothSample.fRDamperLen * 100)); // FR
            }

            // Camera target replay if selected
            if (followed) {
                if (orbitControlsRef && orbitControlsRef.current) {
                    orbitControlsRef.current.target.lerp(smoothSample.position, 0.2);

                    if (timeLineGlobal.cameraMode === CameraMode.Follow) {
                        // move camPosMesh to Follow position
                        camPosRef.current.rotation.setFromQuaternion(carRotation);
                        // move toward where the car is heading

                        const velocitySpeed = smoothSample.velocity.length();
                        // Set camera position behind the car
                        const backwardMax = 6;
                        const backward = (backwardMax - (velocitySpeed / backwardMax));

                        camPosRef.current.position.set(
                            (-smoothSample.velocity.x / 4),
                            (-smoothSample.velocity.y / 4),
                            (-smoothSample.velocity.z / 4),
                        );

                        // Do not force camera behind the car above a certain speed
                        camPosRef.current.translateZ(backward < 0 ? 0 : -backward);
                        camPosRef.current.translateY(3);
                        // move camera to camPosMesh world position
                        const camWorldPos: THREE.Vector3 = new THREE.Vector3();
                        camPosRef.current.getWorldPosition(camWorldPos);
                        camera.position.lerp(camWorldPos, 0.3);
                    }
                }
            }

            // Scale car up if hovered in LoadedReplays
            if (stadiumCarMesh.current) {
                if (hovered) {
                    stadiumCarMesh.current.scale.lerp(new THREE.Vector3(0.02, 0.02, 0.02), 0.2);
                } else {
                    stadiumCarMesh.current.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.2);
                }
            }
        }
    });

    const [opts, setOpts] = useState({
        fontSize: 6,
        color: '#99ccff',
        maxWidth: 200,
        lineHeight: 'normal',
        letterSpacing: 0,
        textAlign: 'left',
        materialType: 'MeshPhongMaterial',
        anchorX: 'center',
        anchorY: 'middle',
        outlineWidth: 0.5,
        outlineColor: 'black',
    });
    const [rotation, setRotation] = useState([0, 0, 0, 0]);

    return (
        <>
            <mesh
                ref={mesh}
                scale={1}
            >
                {replayCarOpacity > 0 && (
                    <primitive
                        object={fbx}
                        dispose={null}
                        ref={stadiumCarMesh}
                        scale={0.01}
                        receiveShadow
                        castShadow
                    />
                )}

                {showInputOverlay
                    && <InputOverlay sampleRef={currentSampleRef} camera={camera} />}
                <mesh
                    ref={camPosRef}
                >
                    <sphereBufferGeometry args={[0.1, 30, 30]} attach="geometry" />
                    <meshBasicMaterial color={replay.color} transparent opacity={0} attach="material" />
                </mesh>

            </mesh>
        </>
    );
};

interface ReplayCarsProps {
    replaysData: ReplayData[];
    orbitControlsRef: any;
    showInputOverlay: boolean;
    replayCarOpacity: number;
}

const ReplayCars = ({
    replaysData,
    orbitControlsRef,
    showInputOverlay,
    replayCarOpacity,
}: ReplayCarsProps): JSX.Element => {
    const camera = useThree((state) => state.camera);
    const fbx = useFBX('/StadiumCarWheelsSeparated.fbx');

    return (
        <>
            {replaysData.map((replay) => (
                <ReplayCar
                    key={`replay-${replay._id}-car`}
                    replay={replay}
                    camera={camera}
                    orbitControlsRef={orbitControlsRef}
                    showInputOverlay={showInputOverlay}
                    fbx={fbx.clone()}
                    replayCarOpacity={replayCarOpacity}
                />
            ))}
        </>
    );
};

export default ReplayCars;
