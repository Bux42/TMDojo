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
import { getClosestSampleIndexBeforeTime } from '../../lib/utils/replay';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';

const BACK_WHEEL_Y = 35.232017517089844;
const FRONT_WHEEL_Y = 35.24349594116211;

const interpolateVec = (a: THREE.Vector3, b: THREE.Vector3, x: number) => (new THREE.Vector3()).lerpVectors(a, b, x);
const interpolateNum = (a: number, b: number, x: number) => a * (1 - x) + b * x;

interface ReplayCarProps {
    replay: ReplayData;
    camera: Camera;
    orbitControlsRef: any;
    showInputOverlay: boolean;
    fbx: THREE.Object3D;
    replayCarOpacity: number;
    cameraMode: CameraMode;
}

const ReplayCar = ({
    replay, camera, orbitControlsRef, showInputOverlay, fbx, replayCarOpacity, cameraMode,
}: ReplayCarProps) => {
    const mesh = useRef<THREE.Mesh>();
    const stadiumCarMesh = useRef<THREE.Mesh>();
    const camPosRef = useRef<THREE.Mesh>();

    const currentSampleRef = useRef<ReplayDataPoint>(replay.samples[0]);

    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    let curSample = replay.samples[0];

    // Get own material from loaded car model
    const carMesh: THREE.Mesh = fbx.children[0] as THREE.Mesh;
    const material: THREE.MeshPhongMaterial = carMesh.material as THREE.MeshPhongMaterial;

    const bodyMaterial = material.clone();
    bodyMaterial.opacity = replayCarOpacity;
    bodyMaterial.color = new THREE.Color(
        replay.color.r,
        replay.color.g,
        replay.color.b,
    );

    const wheelMaterial = material.clone();
    wheelMaterial.opacity = replayCarOpacity;
    wheelMaterial.color = new THREE.Color(0, 0, 0);

    const updateWheelColors = () => {
        wheelMaterial.color = new THREE.Color(
            curSample.inputIsBraking > 0 ? 0.1 : 0,
            0,
            0,
        );
        fbx.children.forEach((child: any, i: number) => {
            if (i >= 1 && i <= 4) {
                child.material = wheelMaterial;
            }
        });
    };

    fbx.children.forEach((child: any, i: number) => {
        if (i === 0 || i === 5 || i === 6) {
            child.material = bodyMaterial;
        }
        updateWheelColors();
    });

    useFrame((state, delta) => {
        if (mesh.current
            && stadiumCarMesh.current
            && camPosRef.current) {
            const followed = timeLineGlobal.followedReplay != null && timeLineGlobal.followedReplay._id === replay._id;
            const hovered = timeLineGlobal.hoveredReplay != null && timeLineGlobal.hoveredReplay._id === replay._id;

            // Get closest sample to TimeLine.currentRaceTime
            const sampleIndex = getClosestSampleIndexBeforeTime(replay, timeLineGlobal.currentRaceTime);

            curSample = replay.samples[sampleIndex];
            currentSampleRef.current = curSample;

            let nextSample = curSample;
            if (sampleIndex + 1 < replay.samples.length) {
                nextSample = replay.samples[sampleIndex + 1];
            }

            // Calculate interpolation/lerp factor
            const timeToGlobalTime = timeLineGlobal.currentRaceTime - curSample.currentRaceTime;
            const timeToNextSample = nextSample.currentRaceTime - curSample.currentRaceTime;
            let lerpFactor = timeToGlobalTime / timeToNextSample;

            // Fail safe to make sure the lerp factor is between 0 and 1
            lerpFactor = Math.min(1, Math.max(0, lerpFactor));

            // Set car position with interpolation
            const interpolatedPos = interpolateVec(curSample.position, nextSample.position, lerpFactor);
            mesh.current.position.set(...interpolatedPos.toArray());

            // Set car rotation with interpolation
            const interpolatedCarRotation: THREE.Quaternion = vecToQuat(
                interpolateVec(curSample.dir, nextSample.dir, lerpFactor),
                interpolateVec(curSample.up, nextSample.up, lerpFactor),
            );
            stadiumCarMesh.current.rotation.setFromQuaternion(interpolatedCarRotation);

            // Set front wheels rotation
            const interpolatedWheelAngle = interpolateNum(curSample.wheelAngle, nextSample.wheelAngle, lerpFactor);
            stadiumCarMesh.current.children[2].rotation.y = interpolatedWheelAngle; // FL
            stadiumCarMesh.current.children[4].rotation.y = interpolatedWheelAngle; // FR

            // Set wheel suspensions
            const interRRDampleLen = interpolateNum(curSample.rRDamperLen, nextSample.rRDamperLen, lerpFactor);
            stadiumCarMesh.current.children[1].position.setY(BACK_WHEEL_Y - (interRRDampleLen * 100)); // RR
            const interFLDamperLen = interpolateNum(curSample.fLDamperLen, nextSample.fLDamperLen, lerpFactor);
            stadiumCarMesh.current.children[2].position.setY(FRONT_WHEEL_Y - (interFLDamperLen * 100)); // FL
            const interRLDampleLen = interpolateNum(curSample.rLDamperLen, nextSample.rLDamperLen, lerpFactor);
            stadiumCarMesh.current.children[3].position.setY(BACK_WHEEL_Y - (interRLDampleLen * 100)); // RL
            const interFRDampleLen = interpolateNum(curSample.fRDamperLen, nextSample.fRDamperLen, lerpFactor);
            stadiumCarMesh.current.children[4].position.setY(FRONT_WHEEL_Y - (interFRDampleLen * 100)); // FR

            // Camera target replay if selected
            if (followed) {
                if (orbitControlsRef && orbitControlsRef.current) {
                    // Normalize velocity to get velocity direction
                    const velocityDir = interpolateVec(curSample.velocity, nextSample.velocity, lerpFactor).normalize();

                    // Set camera target
                    const camTarget = mesh.current.position.clone();

                    // Set camera target and update orbit controls target
                    camera.lookAt(camTarget);
                    orbitControlsRef.current.target.set(...camTarget.toArray());

                    if (cameraMode === CameraMode.Follow) {
                        // Set ref camera position to behind the car
                        camPosRef.current.position.set(
                            mesh.current.position.x - velocityDir.x * 3,
                            mesh.current.position.y - velocityDir.y * 3,
                            mesh.current.position.z - velocityDir.z * 3,
                        );
                        camPosRef.current.translateY(4 - (curSample.speed / 1000));

                        // Update camera position smoothly
                        camera.position.lerp(camPosRef.current.position, 0.1);
                    }
                }
            }

            // Scale car up if hovered in LoadedReplays
            if (hovered) {
                stadiumCarMesh.current.scale.lerp(new THREE.Vector3(0.02, 0.02, 0.02), 0.2);
            } else {
                stadiumCarMesh.current.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.2);
            }

            updateWheelColors();
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
                position={[
                    curSample.position.x,
                    curSample.position.y,
                    curSample.position.z]}
                ref={mesh}
                scale={1}
            >

                <primitive
                    object={fbx}
                    dispose={null}
                    ref={stadiumCarMesh}
                    scale={0.01}
                    receiveShadow
                    castShadow
                />
                {showInputOverlay
                    && <InputOverlay sampleRef={currentSampleRef} camera={camera} />}

            </mesh>

            <mesh
                ref={camPosRef}
            >
                <sphereBufferGeometry args={[0.1, 30, 30]} attach="geometry" />
                <meshBasicMaterial color={replay.color} transparent opacity={0} attach="material" />
            </mesh>
        </>
    );
};

interface ReplayCarsProps {
    replaysData: ReplayData[];
    orbitControlsRef: any;
    showInputOverlay: boolean;
    replayCarOpacity: number;
    cameraMode: CameraMode;
}

const ReplayCars = ({
    replaysData,
    orbitControlsRef,
    showInputOverlay,
    replayCarOpacity,
    cameraMode,
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
                    cameraMode={cameraMode}
                />
            ))}
        </>
    );
};

export default ReplayCars;
