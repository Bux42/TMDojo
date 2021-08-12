import {
    extend, useFrame, Canvas, useThree, useLoader, Camera,
} from '@react-three/fiber';
import * as THREE from 'three';
import React, {
    useRef, useState,
} from 'react';
import { useFBX, useGLTF } from '@react-three/drei';
import { ReplayData } from '../../lib/api/apiRequests';
import { ReplayDataPoint } from '../../lib/replays/replayData';
import { getRaceTimeStr } from '../../lib/utils/time';
import vecToQuat from '../../lib/utils/math';
import { CameraMode } from '../../lib/contexts/SettingsContext';
import InputOverlay from './InputOverlay';
import { TimeLineInfos } from './TimeLine';

const BACK_WHEEL_Y = 35.232017517089844;
const FRONT_WHEEL_Y = 35.24349594116211;

interface ReplayCarProps {
    replay: ReplayData;
    timeLineGlobal: TimeLineInfos;
    camera: Camera;
    orbitControlsRef: any;
    showInputOverlay: boolean;
    fbx: THREE.Object3D;
    replayCarOpacity: number;
    cameraMode: CameraMode;
}

const ReplayCar = ({
    replay, timeLineGlobal, camera, orbitControlsRef, showInputOverlay, fbx, replayCarOpacity, cameraMode,
}: ReplayCarProps) => {
    const mesh = useRef<THREE.Mesh>();
    const stadiumCarMesh = useRef<THREE.Mesh>();
    const camPosRef = useRef<THREE.Mesh>();

    const currentSampleRef = useRef<ReplayDataPoint>(replay.samples[0]);

    let sampleIndex = 0;

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

    useFrame((state, delta) => {
        if (mesh.current
            && stadiumCarMesh.current
            && camPosRef.current) {
            const followed = timeLineGlobal.followedReplay != null && timeLineGlobal.followedReplay._id === replay._id;
            const hovered = timeLineGlobal.hoveredReplay != null && timeLineGlobal.hoveredReplay._id === replay._id;

            // Get closest sample to TimeLine.currentRaceTime
            sampleIndex = Math.round(timeLineGlobal.currentRaceTime / replay.intervalMedian);
            if (sampleIndex > replay.samples.length - 1) {
                sampleIndex = replay.samples.length - 1;
            }
            while (sampleIndex > 0
                && replay.samples[sampleIndex].currentRaceTime > timeLineGlobal.currentRaceTime) {
                sampleIndex--;
            }
            while (sampleIndex + 1 < replay.samples.length
                && replay.samples[sampleIndex].currentRaceTime < timeLineGlobal.currentRaceTime) {
                sampleIndex++;
            }

            const curSample = replay.samples[sampleIndex];
            currentSampleRef.current = curSample;

            // Get car rotation
            const carRotation: THREE.Quaternion = vecToQuat(
                curSample.dir,
                curSample.up,
            );

            // Move & rotate 3D car from current sample rot & pos
            mesh.current.position.set(curSample.position.x, curSample.position.y, curSample.position.z);
            stadiumCarMesh.current.rotation.setFromQuaternion(carRotation);

            // Set front wheels rotation
            stadiumCarMesh.current.children[2].rotation.y = curSample.wheelAngle; // FL
            stadiumCarMesh.current.children[4].rotation.y = curSample.wheelAngle; // FR

            // Set wheel suspensions
            stadiumCarMesh.current.children[1].position.setY(BACK_WHEEL_Y - (curSample.rRDamperLen * 100)); // RR
            stadiumCarMesh.current.children[2].position.setY(FRONT_WHEEL_Y - (curSample.fLDamperLen * 100)); // FL
            stadiumCarMesh.current.children[3].position.setY(BACK_WHEEL_Y - (curSample.rLDamperLen * 100)); // RL
            stadiumCarMesh.current.children[4].position.setY(FRONT_WHEEL_Y - (curSample.fRDamperLen * 100)); // FR

            // Camera target replay if selected
            if (followed) {
                if (orbitControlsRef && orbitControlsRef.current) {
                    orbitControlsRef.current.target = mesh.current.position;
                    if (cameraMode === CameraMode.Follow) {
                        // move toward where the car is heading
                        const velocityOffset = curSample.velocity.clone().multiplyScalar(-0.2);
                        const backPositioning = new THREE.Vector3(0, 4, 2);

                        const nextCamPos = mesh.current.position.clone()
                            .add(velocityOffset)
                            .add(backPositioning);

                        // move camera to camPosMesh world position
                        camera.position.lerp(nextCamPos, 0.3);

                        // set debug cam position
                        camPosRef.current.position.set(camera.position.x, camera.position.y, camera.position.z);
                    }
                }
            }
            // Scale car up if hovered in LoadedReplays
            if (hovered) {
                stadiumCarMesh.current.scale.lerp(new THREE.Vector3(0.02, 0.02, 0.02), 0.2);
            } else {
                stadiumCarMesh.current.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.2);
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
                position={[
                    replay.samples[sampleIndex].position.x,
                    replay.samples[sampleIndex].position.y,
                    replay.samples[sampleIndex].position.z]}
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
    timeLineGlobal: TimeLineInfos;
    orbitControlsRef: any;
    showInputOverlay: boolean;
    replayCarOpacity: number;
    cameraMode: CameraMode;
}

const ReplayCars = ({
    replaysData,
    timeLineGlobal,
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
                    timeLineGlobal={timeLineGlobal}
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
