import {
    extend, useFrame, Canvas, useThree, useLoader, Camera,
} from '@react-three/fiber';
import * as THREE from 'three';
import React, {
    useRef, useState,
} from 'react';
import { Text } from 'troika-three-text';
import { useFBX, useGLTF } from '@react-three/drei';
import { ReplayData } from '../../lib/api/apiRequests';
import { ReplayDataPoint } from '../../lib/replays/replayData';
import { getRaceTimeStr } from '../../lib/utils/time';
import vecToQuat from '../../lib/utils/math';
import { CameraMode } from '../../lib/contexts/SettingsContext';
import InputOverlay from './InputOverlay';
import { TimeLineInfos } from './TimeLine';

extend({ Text });

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
    const meshTxt = useRef<THREE.Mesh>();
    const stadiumCarMesh = useRef<THREE.Mesh>();
    const camPosRef = useRef<THREE.Mesh>();

    const currentSampleRef = useRef<ReplayDataPoint>(replay.samples[0]);

    let sampleIndex = 0;
    let hovered: boolean = false;
    let prevOnClick : number = Date.now();

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
        // eslint-disable-next-line no-param-reassign
        child.material = matClone;
    });

    useFrame((state, delta) => {
        if (mesh.current
            && stadiumCarMesh.current
            && meshTxt.current
            && camPosRef.current) {
            const followed = timeLineGlobal.followedReplay != null && timeLineGlobal.followedReplay._id === replay._id;

            // Get closest sample to TimeLine.currentRaceTime
            sampleIndex = 0;
            while (sampleIndex + 1 < replay.samples.length
                    && replay.samples[sampleIndex].currentRaceTime < timeLineGlobal.currentRaceTime) {
                sampleIndex++;
            }
            currentSampleRef.current = replay.samples[sampleIndex];

            if (hovered) {
                (meshTxt.current.children[0] as any).text = `
                ${replay.playerName}\n
                ${getRaceTimeStr(replay.endRaceTime)}\n
                (click to ${followed ? 'unfollow' : 'follow'})`;
            } else {
                (meshTxt.current.children[0] as any).text = '';
            }

            // Set hover 3D text facing camera with correct size
            const distToCamera = replay.samples[sampleIndex].position.distanceTo(camera.position);

            meshTxt.current.scale.lerp(
                new THREE.Vector3(
                    distToCamera / 400,
                    distToCamera / 400,
                    distToCamera / 400,
                ),
                0.1,
            );
            meshTxt.current.rotation.set(
                camera.rotation.x,
                camera.rotation.y,
                camera.rotation.z,
            );

            // Move & rotate 3D car from current sample rot & pos
            mesh.current.position.lerp(replay.samples[sampleIndex].position, 0.4);
            stadiumCarMesh.current.rotation.setFromQuaternion(
                vecToQuat(replay.samples[sampleIndex].dir, replay.samples[sampleIndex].up),
            );

            // Set front wheels rotation
            stadiumCarMesh.current.children[2].rotation.y = replay.samples[sampleIndex].wheelAngle;
            stadiumCarMesh.current.children[4].rotation.y = replay.samples[sampleIndex].wheelAngle;

            // Rotate camPosRef with car
            camPosRef.current.rotation.setFromQuaternion(
                vecToQuat(replay.samples[sampleIndex].dir, replay.samples[sampleIndex].up),
            );

            // Set camPos to inverse velocity to smoothly zoom out when car accelerates
            const camPos = replay.samples[sampleIndex].velocity.clone().negate().divideScalar(3);
            camPos.x += 4;
            camPos.y += 5;
            camPosRef.current.position.lerp(camPos, 0.4);

            // Camera target replay if selected
            if (followed) {
                if (orbitControlsRef && orbitControlsRef.current) {
                    orbitControlsRef.current.target.lerp(replay.samples[sampleIndex].position, 0.2);
                    if (cameraMode === CameraMode.Cam1) {
                        const camWorldPos: THREE.Vector3 = new THREE.Vector3();
                        camPosRef.current.getWorldPosition(camWorldPos);
                        camera.position.lerp(camWorldPos, 0.3);
                    }
                }
            }
        }
    });

    const onPointerLeave = (e: MouseEvent) => {
        hovered = false;
    };

    const onPointerMove = (e: MouseEvent) => {
        hovered = true;
    };

    const onClick = () => {
        if (Date.now() - prevOnClick > 100) {
            if (timeLineGlobal.followedReplay === null
                || timeLineGlobal.followedReplay._id !== replay._id) {
                // eslint-disable-next-line no-param-reassign
                timeLineGlobal.followedReplay = replay;
            } else {
                // eslint-disable-next-line no-param-reassign
                timeLineGlobal.followedReplay = null;
            }
            prevOnClick = Date.now();
        }
    };

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
                    onPointerLeave={onPointerLeave}
                    onPointerMove={onPointerMove}
                    onClick={onClick}
                    receiveShadow
                    castShadow
                />

                {showInputOverlay
                    && <InputOverlay sampleRef={currentSampleRef} camera={camera} />}

                <mesh
                    ref={meshTxt}
                >
                    <text
                        position-z={200}
                        /* eslint-disable react/jsx-props-no-spreading */
                        {...opts}
                    >
                        <meshPhongMaterial attach="material" color={opts.color} />
                    </text>
                </mesh>
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
