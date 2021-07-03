/* eslint-disable no-param-reassign */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ReplayDataPoint } from '../../lib/replays/replayData';

interface InputOverlayProps {
    sampleRef: React.MutableRefObject<ReplayDataPoint>,
    camera: any
}

interface InputOverlayItemProps {
    sampleRef: React.MutableRefObject<ReplayDataPoint>,
}

const InputBrakeOverlay = ({ sampleRef }: InputOverlayItemProps) => {
    const brakeMeshRef = useRef<THREE.Mesh>();
    const brakeInputFloats: Float32Array[] = [
        new Float32Array([
            -1.8, -0.1, 0,
            1.8, -0.1, 0,
            1.8, -10, 0,
        ]),
        new Float32Array([
            -1.8, -0.1, 0,
            -1.8, -10, 0,
            1.8, -10, 0,
        ]),
        new Float32Array([
            -1.8, -10, 0,
            1.8, -10, 0,
            0, -12, 0,
        ]),
    ];

    useFrame(() => {
        if (sampleRef.current && brakeMeshRef.current) {
            const isBraking = sampleRef.current.inputIsBraking;
            brakeMeshRef.current.children.forEach((children: any) => {
                children.material.opacity = isBraking ? 0.6 : 0.2;
            });
        }
    });

    return (
        <mesh
            ref={brakeMeshRef}
        >
            {
                brakeInputFloats.map((vertices) => (
                    <mesh key={vertices.join()}>
                        <bufferGeometry attach="geometry">
                            <bufferAttribute
                                needsUpdate
                                attachObject={['attributes', 'position']}
                                count={vertices.length / 3}
                                itemSize={3}
                                array={vertices}
                            />
                        </bufferGeometry>
                        <meshBasicMaterial
                            attach="material"
                            color="#db441a"
                            transparent
                            opacity={0.2}
                            wireframe={false}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))
            }
        </mesh>
    );
};

const InputGasOverlay = ({ sampleRef }: InputOverlayItemProps) => {
    const gasMeshRef = useRef<THREE.Mesh>();
    const accelInputFloats: Float32Array[] = [
        new Float32Array([
            -1.8, 0.1, 0,
            1.8, 0.1, 0,
            1.8, 10, 0,
        ]),
        new Float32Array([
            -1.8, 0.1, 0,
            -1.8, 10, 0,
            1.8, 10, 0,
        ]),
        new Float32Array([
            -1.8, 10, 0,
            1.8, 10, 0,
            0, 12, 0,
        ]),
    ];

    useFrame(() => {
        if (sampleRef.current && gasMeshRef.current) {
            const isAccelerating = sampleRef.current.inputGasPedal;
            gasMeshRef.current.children.forEach((children: any) => {
                children.material.opacity = isAccelerating ? 0.6 : 0.2;
            });
        }
    });

    return (
        <mesh
            ref={gasMeshRef}
        >
            {
                accelInputFloats.map((vertices) => (
                    <mesh key={vertices.join()}>
                        <bufferGeometry attach="geometry">
                            <bufferAttribute
                                needsUpdate
                                attachObject={['attributes', 'position']}
                                count={vertices.length / 3}
                                itemSize={3}
                                array={vertices}
                            />
                        </bufferGeometry>
                        <meshBasicMaterial
                            attach="material"
                            color="lime"
                            transparent
                            opacity={0.2}
                            wireframe={false}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))
            }
        </mesh>
    );
};

const SteerLeftOverlay = ({ sampleRef }: InputOverlayItemProps) => {
    const leftMeshRef = useRef<THREE.Mesh>();
    const steerLeftVecs: THREE.Vector3[] = [
        new THREE.Vector3(-2, 10, 0),
        new THREE.Vector3(-2, -10, 0),
        new THREE.Vector3(-12, 0, 0),
    ];
    const f32arrayRight = useMemo(
        () => Float32Array.from(
            new Array(steerLeftVecs.length)
                .fill(0)
                .flatMap((item, index) => steerLeftVecs[index].toArray()),
        ),
        [steerLeftVecs],
    );
    useFrame(() => {
        if (sampleRef.current && leftMeshRef.current) {
            if (sampleRef.current.inputSteer < 0) {
                steerLeftVecs[2].setX(10 * sampleRef.current.inputSteer - 2);
                leftMeshRef.current.geometry.setFromPoints(steerLeftVecs);
                leftMeshRef.current.geometry.attributes.position.needsUpdate = true;
            } else {
                steerLeftVecs[2].setX(-2);
                leftMeshRef.current.geometry.setFromPoints(steerLeftVecs);
                leftMeshRef.current.geometry.attributes.position.needsUpdate = true;
            }
        }
    });
    return (
        <>
            <mesh
                ref={leftMeshRef}
            >
                <bufferGeometry attach="geometry">
                    <bufferAttribute
                        needsUpdate
                        attachObject={['attributes', 'position']}
                        count={3}
                        itemSize={3}
                        array={f32arrayRight}
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
            <mesh>
                <bufferGeometry attach="geometry">
                    <bufferAttribute
                        needsUpdate
                        attachObject={['attributes', 'position']}
                        count={3}
                        itemSize={3}
                        array={f32arrayRight}
                    />
                </bufferGeometry>
                <meshBasicMaterial
                    attach="material"
                    color="#5243aa"
                    transparent
                    opacity={0.5}
                    wireframe={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </>
    );
};

const SteerRightOverlay = ({ sampleRef }: InputOverlayItemProps) => {
    const rightMeshRef = useRef<THREE.Mesh>();
    const steerRightVecs: THREE.Vector3[] = [
        new THREE.Vector3(2, 10, 0),
        new THREE.Vector3(2, -10, 0),
        new THREE.Vector3(12, 0, 0),
    ];
    const f32arrayRight = useMemo(
        () => Float32Array.from(
            new Array(steerRightVecs.length)
                .fill(0)
                .flatMap((item, index) => steerRightVecs[index].toArray()),
        ),
        [steerRightVecs],
    );
    useFrame(() => {
        if (sampleRef.current && rightMeshRef.current) {
            if (sampleRef.current.inputSteer > 0) {
                steerRightVecs[2].setX((10 * Math.abs(sampleRef.current.inputSteer) + 2));
                rightMeshRef.current.geometry.setFromPoints(steerRightVecs);
                rightMeshRef.current.geometry.attributes.position.needsUpdate = true;
            } else {
                steerRightVecs[2].setX(2);
                rightMeshRef.current.geometry.setFromPoints(steerRightVecs);
                rightMeshRef.current.geometry.attributes.position.needsUpdate = true;
            }
        }
    });
    return (
        <>
            <mesh
                ref={rightMeshRef}
            >
                <bufferGeometry attach="geometry">
                    <bufferAttribute
                        needsUpdate
                        attachObject={['attributes', 'position']}
                        count={3}
                        itemSize={3}
                        array={f32arrayRight}
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
            <mesh>
                <bufferGeometry attach="geometry">
                    <bufferAttribute
                        needsUpdate
                        attachObject={['attributes', 'position']}
                        count={3}
                        itemSize={3}
                        array={f32arrayRight}
                    />
                </bufferGeometry>
                <meshBasicMaterial
                    attach="material"
                    color="#5243aa"
                    transparent
                    opacity={0.5}
                    wireframe={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </>
    );
};

const InputOverlay = ({ sampleRef, camera }: InputOverlayProps) => {
    const inputMeshRef = useRef<THREE.Mesh>();
    useFrame(() => {
        if (inputMeshRef.current && camera) {
            inputMeshRef.current.rotation.set(
                camera.rotation.x,
                camera.rotation.y,
                camera.rotation.z,
            );
        }
    });
    return (
        <mesh
            ref={inputMeshRef}
            position={[0, 2, 0]}
            scale={0.1}
        >
            <SteerRightOverlay sampleRef={sampleRef} />
            <SteerLeftOverlay sampleRef={sampleRef} />
            <InputGasOverlay sampleRef={sampleRef} />
            <InputBrakeOverlay sampleRef={sampleRef} />
        </mesh>
    );
};

export default InputOverlay;
