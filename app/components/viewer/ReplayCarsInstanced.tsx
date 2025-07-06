import * as THREE from 'three';
import { useFrame, useThree, Camera } from '@react-three/fiber';
import { Instance, Instances, useFBX, Text } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { ReplayData } from '../../lib/api/requests/replays';
import InputOverlay from './InputOverlay';
import { CameraMode } from '../../lib/contexts/SettingsContext';
import {
    getFLDamperLenFromDataPoint,
    getFRDamperLenFromDataPoint,
    ReplayDataPoint,
} from '../../lib/replays/replayData';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';
import { getSampleNearTime, interpolateSamples } from '../../lib/utils/replay';
import vecToQuat from '../../lib/utils/math';

// Constants for wheel positions
// On blender, since the mesh size if 100x bigger, the positions need to be divided by 100
// If a position value is negative, make it positive?
const WHEEL_FL_POS = new THREE.Vector3(0.82105, 0.352434, 1.78311);
const WHEEL_FR_POS = new THREE.Vector3(-0.82105, 0.352434, 1.78311);
const WHEEL_RR_POS = new THREE.Vector3(-0.82105, 0.352529, -1.20153);
const WHEEL_RL_POS = new THREE.Vector3(0.82105, 0.352529, -1.20153);

const BACK_WHEEL_Y = 35.232017517089844;
const FRONT_WHEEL_Y = 35.24349594116211;

interface ReplayCarWheelProps {
    replay: ReplayData;
    replayCarOpacity: number;
    wheelStaticPosition: THREE.Vector3;
    suspensionCallback: (dataPoint: ReplayDataPoint) => number;
    steerable?: boolean;
}

const ReplayCarWheel = (props: ReplayCarWheelProps) => {
    const {
        replay,
        replayCarOpacity,
        wheelStaticPosition,
        suspensionCallback,
        steerable,
    } = props;

    const wheelRef: React.MutableRefObject<
        | THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
        | undefined
    > = useRef();

    const parentRef: React.MutableRefObject<
        | THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
        | undefined
    > = useRef();

    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    const currentSampleRef = useRef<ReplayDataPoint>(replay.samples[0]);
    const prevSampleRef = useRef<ReplayDataPoint>(replay.samples[0]);
    const smoothSample: ReplayDataPoint = replay.samples[0].clone();

    useFrame((state, delta) => {
        // Get closest sample to TimeLine.currentRaceTime
        const curSample = getSampleNearTime(
            replay,
            timeLineGlobal.currentRaceTime,
        );

        currentSampleRef.current = curSample;
        prevSampleRef.current =
            replay.samples[replay.samples.indexOf(curSample) - 1];

        if (prevSampleRef.current) {
            if (timeLineGlobal.currentRaceTime < replay.endRaceTime) {
                interpolateSamples(
                    prevSampleRef.current,
                    curSample,
                    smoothSample,
                    timeLineGlobal.currentRaceTime,
                );
            } else {
                interpolateSamples(
                    prevSampleRef.current,
                    curSample,
                    smoothSample,
                    curSample.currentRaceTime,
                );
            }
        }

        // Get car rotation
        const carRotation: THREE.Quaternion = vecToQuat(
            smoothSample.dir,
            smoothSample.up,
        );

        if (parentRef.current) {
            parentRef.current.position.set(
                smoothSample.position.x,
                smoothSample.position.y,
                smoothSample.position.z,
            );

            parentRef.current.rotation.setFromQuaternion(carRotation);
        }

        if (wheelRef.current) {
            if (steerable) {
                wheelRef.current.rotation.y = smoothSample.wheelAngle;
            }

            wheelRef.current.position.set(
                wheelStaticPosition.x,
                wheelStaticPosition.y,
                wheelStaticPosition.z,
            );

            wheelRef.current.position.setY(
                wheelRef.current.position.y - suspensionCallback(smoothSample),
            );
        }
    });

    return (
        <mesh ref={parentRef}>
            <Instance
                ref={wheelRef}
                scale={0.01}
            />
        </mesh>
    );
};

interface ReplayCarProps {
    replay: ReplayData;
    camera: Camera;
    orbitControlsRef: any;
    showInputOverlay: boolean;
    // fbx: THREE.Object3D;
    replayCarOpacity: number;
}

const ReplayCarInstanced = (props: ReplayCarProps) => {
    const {
        replay,
        camera,
        orbitControlsRef,
        showInputOverlay,
        // fbx,
        replayCarOpacity,
    } = props;

    const ref: React.MutableRefObject<
        | THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
        | undefined
    > = useRef();
    const camPosRef = useRef<THREE.Mesh>();
    const camParentRef: React.MutableRefObject<
        | THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
        | undefined
    > = useRef();

    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    const currentSampleRef = useRef<ReplayDataPoint>(replay.samples[0]);
    const prevSampleRef = useRef<ReplayDataPoint>(replay.samples[0]);
    const smoothSample: ReplayDataPoint = replay.samples[0].clone();

    useFrame((state, delta) => {
        timeLineGlobal.tickTime = 1000 / 60;

        // Get closest sample to TimeLine.currentRaceTime
        const curSample = getSampleNearTime(
            replay,
            timeLineGlobal.currentRaceTime,
        );

        currentSampleRef.current = curSample;
        prevSampleRef.current =
            replay.samples[replay.samples.indexOf(curSample) - 1];

        if (prevSampleRef.current) {
            if (timeLineGlobal.currentRaceTime < replay.endRaceTime) {
                interpolateSamples(
                    prevSampleRef.current,
                    curSample,
                    smoothSample,
                    timeLineGlobal.currentRaceTime,
                );
            } else {
                interpolateSamples(
                    prevSampleRef.current,
                    curSample,
                    smoothSample,
                    curSample.currentRaceTime,
                );
            }
        }

        // Get car rotation
        const carRotation: THREE.Quaternion = vecToQuat(
            smoothSample.dir,
            smoothSample.up,
        );

        const followed =
            timeLineGlobal.followedReplay != null &&
            timeLineGlobal.followedReplay._id === replay._id;

        const hovered =
            timeLineGlobal.hoveredReplay != null &&
            timeLineGlobal.hoveredReplay._id === replay._id;

        if (camParentRef.current) {
            camParentRef.current.position.set(
                smoothSample.position.x,
                smoothSample.position.y,
                smoothSample.position.z,
            );
        }

        if (ref.current) {
            ref.current.position.set(
                smoothSample.position.x,
                smoothSample.position.y,
                smoothSample.position.z,
            );

            ref.current.rotation.setFromQuaternion(carRotation);

            if (hovered) {
                ref.current.scale.lerp(
                    new THREE.Vector3(0.011, 0.011, 0.011),
                    0.2,
                );
            } else {
                ref.current.scale.lerp(
                    new THREE.Vector3(0.01, 0.01, 0.01),
                    0.2,
                );
            }
        }

        // Camera target replay if selected
        if (followed && camPosRef.current) {
            if (orbitControlsRef && orbitControlsRef.current) {
                orbitControlsRef.current.target.lerp(
                    smoothSample.position,
                    0.2,
                );

                if (timeLineGlobal.cameraMode === CameraMode.Follow) {
                    // move camPosMesh to Follow position
                    camPosRef.current.rotation.setFromQuaternion(carRotation);
                    // move toward where the car is heading

                    const velocitySpeed = smoothSample.velocity.length();
                    // Set camera position behind the car
                    const backwardMax = 6;
                    const backward = backwardMax - velocitySpeed / backwardMax;

                    camPosRef.current.position.set(
                        -smoothSample.velocity.x / 4,
                        -smoothSample.velocity.y / 4,
                        -smoothSample.velocity.z / 4,
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
    });
    return (
        <>
            <Instance
                ref={ref}
                scale={0.01}
                color={replay.color}
            />
            <mesh ref={camParentRef}>
                <mesh ref={camPosRef}>
                    <sphereBufferGeometry
                        args={[0.1, 30, 30]}
                        attach="geometry"
                    />
                    <meshBasicMaterial
                        color={replay.color}
                        transparent
                        opacity={0}
                        attach="material"
                    />
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

const getFbxChildrenByName = (fbx: THREE.Object3D, name: string): THREE.Mesh =>
    fbx.children.find((child) => child.name === name) as THREE.Mesh;

const ReplayCarsInstanced = ({
    replaysData,
    orbitControlsRef,
    showInputOverlay,
    replayCarOpacity,
}: ReplayCarsProps): JSX.Element => {
    const camera = useThree((state) => state.camera);
    const fbx = useFBX('/StadiumCarWheelsSeparated_2_allaplha.fbx');

    console.log('💥fbx:', fbx);

    // get all car parths we wich to instance

    const carMesh = getFbxChildrenByName(fbx, 'CAR');
    const { geometry: carGeometry, material: carMaterial } = carMesh;

    const wheelFl = getFbxChildrenByName(fbx, 'WHEEL_FL');
    const { geometry: wheelFlGeometry, material: wheelFlMaterial } = wheelFl;

    const wheelFr = getFbxChildrenByName(fbx, 'WHEEL_FR');
    const { geometry: wheelFrGeometry, material: wheelFrMaterial } = wheelFr;

    const wheelRl = getFbxChildrenByName(fbx, 'WHEEL_RL');
    const { geometry: wheelRlGeometry, material: wheelRlMaterial } = wheelRl;

    const wheelRr = getFbxChildrenByName(fbx, 'WHEEL_RR');
    const { geometry: wheelRrGeometry, material: wheelRrMaterial } = wheelRr;

    return (
        <>
            {/* Car body instances */}
            <Instances
                range={replaysData.length}
                material={carMaterial}
                geometry={carGeometry}
            >
                {replaysData.map((replay) => (
                    <ReplayCarInstanced
                        key={`replay-${replay._id}-car`}
                        replay={replay}
                        camera={camera}
                        orbitControlsRef={orbitControlsRef}
                        showInputOverlay={showInputOverlay}
                        replayCarOpacity={replayCarOpacity}
                    />
                ))}
            </Instances>
            {/* Car FL wheel instances */}
            <Instances
                range={replaysData.length}
                material={wheelFlMaterial}
                geometry={wheelFlGeometry}
            >
                {replaysData.map((replay) => (
                    <ReplayCarWheel
                        key={`replay-${replay._id}-wheel-fl`}
                        replay={replay}
                        replayCarOpacity={replayCarOpacity}
                        wheelStaticPosition={WHEEL_FL_POS}
                        suspensionCallback={getFLDamperLenFromDataPoint}
                        steerable
                    />
                ))}
            </Instances>
            {/* Car FR wheel instances */}
            <Instances
                range={replaysData.length}
                material={wheelFrMaterial}
                geometry={wheelFrGeometry}
            >
                {replaysData.map((replay) => (
                    <ReplayCarWheel
                        key={`replay-${replay._id}-wheel-fr`}
                        replay={replay}
                        replayCarOpacity={replayCarOpacity}
                        wheelStaticPosition={WHEEL_FR_POS}
                        suspensionCallback={getFRDamperLenFromDataPoint}
                        steerable
                    />
                ))}
            </Instances>
            {/* Car RL wheel instances */}
            <Instances
                range={replaysData.length}
                material={wheelRlMaterial}
                geometry={wheelRlGeometry}
            >
                {replaysData.map((replay) => (
                    <ReplayCarWheel
                        key={`replay-${replay._id}-wheel-rl`}
                        replay={replay}
                        replayCarOpacity={replayCarOpacity}
                        wheelStaticPosition={WHEEL_RL_POS}
                        suspensionCallback={getFLDamperLenFromDataPoint}
                    />
                ))}
            </Instances>
            {/* Car RR wheel instances */}
            <Instances
                range={replaysData.length}
                material={wheelRrMaterial}
                geometry={wheelRrGeometry}
            >
                {replaysData.map((replay) => (
                    <ReplayCarWheel
                        key={`replay-${replay._id}-wheel-rr`}
                        replay={replay}
                        replayCarOpacity={replayCarOpacity}
                        wheelStaticPosition={WHEEL_RR_POS}
                        suspensionCallback={getFLDamperLenFromDataPoint}
                    />
                ))}
            </Instances>
        </>
    );
};

export default ReplayCarsInstanced;
