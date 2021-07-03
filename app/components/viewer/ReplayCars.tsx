/* eslint-disable no-param-reassign */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable import/prefer-default-export */
import {
    extend, useFrame, Canvas, useThree, useLoader,
} from '@react-three/fiber';
import * as THREE from 'three';
import {
    BufferAttribute, BufferGeometry, DoubleSide, MeshPhongMaterial, Triangle,
} from 'three';
import React, {
    useRef, useState, useEffect, useMemo, Suspense,
} from 'react';
import { Text } from 'troika-three-text';
import { GLTFLoader } from 'three-stdlib';
import { useFBX, useGLTF } from '@react-three/drei';
import { ReplayData } from '../../lib/api/apiRequests';
import fonts from '../../assets/fonts';
import { ReplayDataPoint } from '../../lib/replays/replayData';
import { InputOverlay } from './InputOverlay';
import { getRaceTimeStr } from '../../lib/utils/time';
import vecToQuat from '../../lib/utils/math';

extend({ Text });

interface ReplayCarProps {
    replay: ReplayData;
    timeLineGlobal: any;
    camera: any;
    orbitControlsRef: any;
    showInputOverlay: boolean;
    fbx: THREE.Object3D;
    replayCarOpacity: number;
    cameraMode: string;
}

const ReplayCar = ({
    replay, timeLineGlobal, camera, orbitControlsRef, showInputOverlay, fbx, replayCarOpacity, cameraMode,
}: ReplayCarProps) => {
    const mesh = useRef<THREE.Mesh>(null!);
    const meshTxt = useRef<THREE.Mesh>(null!);
    const stadiumCarMesh = useRef<THREE.Mesh>(null!);
    const velocityRef = useRef<THREE.Mesh>(null!);

    const CurrentSampleRef = useRef<ReplayDataPoint>(null!);

    let sampleIndex = 0;
    let hovered: boolean = false;
    let prevOnClick : number = Date.now();

    const pressedKeys: any = {};

    const childrend: THREE.Mesh = fbx.children[0] as THREE.Mesh;
    const material: THREE.MeshPhongMaterial = childrend.material as THREE.MeshPhongMaterial;
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
        if (!mesh || !mesh.current) {
            return;
        }

        if (mesh && mesh.current && mesh.current) {
            sampleIndex = 0;
            while (sampleIndex + 1 < replay.samples.length
                    && replay.samples[sampleIndex].currentRaceTime < timeLineGlobal.currentRaceTime) {
                sampleIndex++;
            }
            CurrentSampleRef.current = replay.samples[sampleIndex];

            const distToCamera = replay.samples[sampleIndex].position.distanceTo(camera.position);

            if (hovered) {
                (meshTxt.current.children[0] as any).text = `
                ${replay.playerName}\n
                ${getRaceTimeStr(replay.endRaceTime)}\n
                cameraMode: ${cameraMode}\n
                (click to focus/unfocus)`;
            } else {
                (meshTxt.current.children[0] as any).text = '';
            }

            meshTxt.current.scale.set(distToCamera / 400, distToCamera / 400, distToCamera / 400);
            meshTxt.current.rotation.set(
                camera.rotation.x,
                camera.rotation.y,
                camera.rotation.z,
            );

            mesh.current.position.lerp(replay.samples[sampleIndex].position, 0.4);
            stadiumCarMesh.current.rotation.setFromQuaternion(
                vecToQuat(replay.samples[sampleIndex].dir, replay.samples[sampleIndex].up),
            );

            stadiumCarMesh.current.children[2].rotation.y = replay.samples[sampleIndex].wheelAngle;
            stadiumCarMesh.current.children[4].rotation.y = replay.samples[sampleIndex].wheelAngle;

            velocityRef.current.rotation.setFromQuaternion(
                vecToQuat(replay.samples[sampleIndex].dir, replay.samples[sampleIndex].up),
            );

            const camPos = replay.samples[sampleIndex].velocity.clone().negate().divideScalar(3);
            camPos.x += 4;
            camPos.y += 5;
            velocityRef.current.position.lerp(camPos, 0.4);

            if (timeLineGlobal.followedReplay != null && timeLineGlobal.followedReplay._id === replay._id) {
                if (orbitControlsRef && orbitControlsRef.current) {
                    orbitControlsRef.current.target.lerp(replay.samples[sampleIndex].position, 0.4);
                    if (cameraMode === '1') {
                        const camWorldPos: THREE.Vector3 = new THREE.Vector3();
                        velocityRef.current.getWorldPosition(camWorldPos);
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
                timeLineGlobal.followedReplay = replay;
            } else {
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
        font: fonts.Comfortaa,
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
                    && <InputOverlay sampleRef={CurrentSampleRef} camera={camera} />}

                <mesh
                    ref={meshTxt}
                >
                    <text
                        position-z={200}
                        {...opts}
                    >
                        {opts.materialType === 'MeshPhongMaterial' ? (
                            <meshPhongMaterial attach="material" side={DoubleSide} color={opts.color} />
                        ) : null}
                    </text>
                </mesh>
                <mesh
                    ref={velocityRef}
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
    timeLineGlobal: any;
    orbitControlsRef: any;
    showInputOverlay: boolean;
    replayCarOpacity: number;
    cameraMode: string;
}

export const ReplayCars = ({
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
                <>
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
                </>
            ))}
        </>
    );
};
