/* eslint-disable no-param-reassign */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable import/prefer-default-export */
import {
    extend, useFrame, Canvas, useThree, useLoader,
} from '@react-three/fiber';
import * as THREE from 'three';
import {
    BufferAttribute, BufferGeometry, DoubleSide, Triangle,
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

extend({ Text });

const vec = new THREE.Vector3();
const vec2 = new THREE.Vector3();
const quat = new THREE.Quaternion();

function vecToQuat(forward: THREE.Vector3, up: THREE.Vector3) {
    const vector = forward.normalize();
    const vector2 = vec.copy(new THREE.Vector3(0, 0, 0)).crossVectors(up, vector).normalize();
    const vector3 = vec2.copy(new THREE.Vector3(0, 0, 0)).crossVectors(vector, vector2);
    const m00 = vector2.x;
    const m01 = vector2.y;
    const m02 = vector2.z;
    const m10 = vector3.x;
    const m11 = vector3.y;
    const m12 = vector3.z;
    const m20 = vector.x;
    const m21 = vector.y;
    const m22 = vector.z;

    const num8 = (m00 + m11) + m22;
    const quaternion = quat;
    if (num8 > 0.0) {
        let num = Math.sqrt(num8 + 1.0);
        quaternion.w = num * 0.5;
        num = 0.5 / num;
        quaternion.x = (m12 - m21) * num;
        quaternion.y = (m20 - m02) * num;
        quaternion.z = (m01 - m10) * num;
        return quaternion;
    }
    if ((m00 >= m11) && (m00 >= m22)) {
        const num7 = Math.sqrt(((1.0 + m00) - m11) - m22);
        const num4 = 0.5 / num7;
        quaternion.x = 0.5 * num7;
        quaternion.y = (m01 + m10) * num4;
        quaternion.z = (m02 + m20) * num4;
        quaternion.w = (m12 - m21) * num4;
        return quaternion;
    }
    if (m11 > m22) {
        const num6 = Math.sqrt(((1.0 + m11) - m00) - m22);
        const num3 = 0.5 / num6;
        quaternion.x = (m10 + m01) * num3;
        quaternion.y = 0.5 * num6;
        quaternion.z = (m21 + m12) * num3;
        quaternion.w = (m20 - m02) * num3;
        return quaternion;
    }
    const num5 = Math.sqrt(((1.0 + m22) - m00) - m11);
    const num2 = 0.5 / num5;
    quaternion.x = (m20 + m02) * num2;
    quaternion.y = (m21 + m12) * num2;
    quaternion.z = 0.5 * num5;
    quaternion.w = (m01 - m10) * num2;
    return quaternion;
}

interface ReplayCarProps {
    replay: ReplayData;
    timeLineGlobal: any;
    camera: any;
    orbitControlsRef: any;
    showInputOverlay: boolean;
    fbx: THREE.Object3D;
}

const ReplayCar = ({
    replay, timeLineGlobal, camera, orbitControlsRef, showInputOverlay, fbx,
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

    fbx.children.forEach((child: any) => {
        child.material = child.material.clone();
        child.material.opacity = 0.3;
        child.material.color = {
            r: replay.color.r,
            g: replay.color.g,
            b: replay.color.b,
        };
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

            const dist = mesh.current.position.distanceTo(camera.position);
            meshTxt.current.children[0].scale.set(dist / 300, dist / 300, dist / 300);

            const distToCamera = replay.samples[sampleIndex].position.distanceTo(camera.position);

            if (hovered) {
                (meshTxt.current.children[0] as any).text = `
                ${replay.playerName}\n
                ${getRaceTimeStr(replay.endRaceTime)}\n
                distToCamera: ${distToCamera}\n
                (click to focus/unfocus)`;
            } else {
                (meshTxt.current.children[0] as any).text = '';
            }

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
                    const camWorldPos: THREE.Vector3 = new THREE.Vector3();
                    velocityRef.current.getWorldPosition(camWorldPos);
                    camera.position.lerp(camWorldPos, 0.3);
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
                    && <InputOverlay parentRef={mesh} sampleRef={CurrentSampleRef} camera={camera} />}

                <mesh
                    ref={meshTxt}
                >
                    <text
                        position-z={30}
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
}

export const ReplayCars = ({
    replaysData,
    timeLineGlobal,
    orbitControlsRef,
    showInputOverlay,
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
                    />
                </>
            ))}
        </>
    );
};
