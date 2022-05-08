import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { BoxGeometry } from 'three';
import { ReplayDataPoint } from '../../lib/replays/replayData';

interface InputOverlayProps {
    sampleRef: React.MutableRefObject<ReplayDataPoint>,
    overlayFbx: THREE.Object3D;
    camera: any
}

interface InputOverlayItemProps {
    sampleRef: React.MutableRefObject<ReplayDataPoint>,
}

interface SteerDirectionOverlayProps
{
    sampleRef: React.MutableRefObject<ReplayDataPoint>,
    dir: 'right' | 'left',
    getOffsetFunc: (inputSteer: number) => number;
}

const getOffsetXLeft = (inputSteer: number) => {
    if (inputSteer < 0) {
        return (10 * inputSteer - 2);
    }
    return (-2);
};

const getOffsetXRight = (inputSteer: number) => {
    if (inputSteer > 0) {
        return ((10 * Math.abs(inputSteer) + 2));
    }
    return (2);
};

const SteerDirectionOverlay = ({ sampleRef, dir, getOffsetFunc }: SteerDirectionOverlayProps) => {
    const arrowMeshRef = useRef<THREE.Mesh>();
    const dirToVecArray: { [dir: string]: THREE.Vector3[]; } = {
        left: [
            new THREE.Vector3(-2, 10, 0),
            new THREE.Vector3(-2, -10, 0),
            new THREE.Vector3(-12, 0, 0),
        ],
        right: [
            new THREE.Vector3(2, 10, 0),
            new THREE.Vector3(2, -10, 0),
            new THREE.Vector3(12, 0, 0),
        ],
    };
    const arrowMeshVecs: THREE.Vector3[] = dirToVecArray[dir];

    const f32array = useMemo(
        () => Float32Array.from(
            new Array(arrowMeshVecs.length)
                .fill(0)
                .flatMap((item, index) => arrowMeshVecs[index].toArray()),
        ),
        [arrowMeshVecs],
    );

    useFrame(() => {
        if (sampleRef.current && arrowMeshRef.current) {
            arrowMeshVecs[2].setX(getOffsetFunc(sampleRef.current.inputSteer));
            arrowMeshRef.current.geometry.setFromPoints(arrowMeshVecs);
            arrowMeshRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });
    return (
        <>
            <mesh
                ref={arrowMeshRef}
            >
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
            <mesh>
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
            brakeMeshRef.current.children.forEach((child: any) => {
                child.material.opacity = isBraking ? 0.6 : 0.2;
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
            gasMeshRef.current.children.forEach((child: any) => {
                child.material.opacity = isAccelerating ? 0.6 : 0.2;
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

const InputOverlay = ({ sampleRef, overlayFbx, camera }: InputOverlayProps) => {
    const inputMeshRef = useRef<THREE.Mesh>();

    const inputGasMesh: THREE.Mesh = overlayFbx.children.find((x) => x.name === 'InputGas') as THREE.Mesh;
    const inputGasMeshIndex = overlayFbx.children.indexOf(inputGasMesh);

    const inputBrakeMesh: THREE.Mesh = overlayFbx.children.find((x) => x.name === 'InputBrake') as THREE.Mesh;
    const inputBrakeMeshIndex = overlayFbx.children.indexOf(inputBrakeMesh);

    const inputRightMesh: THREE.Mesh = overlayFbx.children.find((x) => x.name === 'InputRight') as THREE.Mesh;
    (inputRightMesh.material as THREE.MeshPhongMaterial).opacity = 0.8;
    const inputRightMeshIndex = overlayFbx.children.indexOf(inputRightMesh);

    const inputLeftMesh: THREE.Mesh = overlayFbx.children.find((x) => x.name === 'InputLeft') as THREE.Mesh;
    (inputLeftMesh.material as THREE.MeshPhongMaterial).opacity = 0.8;
    const inputLeftMeshIndex = overlayFbx.children.indexOf(inputLeftMesh);

    const inputLeftBgMesh: THREE.Mesh = overlayFbx.children.find((x) => x.name === 'InputLeftBg') as THREE.Mesh;
    (inputLeftBgMesh.material as THREE.MeshPhongMaterial).opacity = 0.2;

    const inputRightBgMesh: THREE.Mesh = overlayFbx.children.find((x) => x.name === 'InputRightBg') as THREE.Mesh;
    (inputRightBgMesh.material as THREE.MeshPhongMaterial).opacity = 0.2;

    const inputBaseScaleX = inputLeftMesh.scale.x;

    overlayFbx.children.forEach((child: any) => {
        child.material = child.material.clone();
        child.material.transparent = true;
    });

    useFrame(() => {
        if (inputMeshRef.current) {
            if (camera) {
                inputMeshRef.current.rotation.set(
                    camera.rotation.x,
                    camera.rotation.y,
                    camera.rotation.z,
                );
            }
            ((inputMeshRef.current.children[0].children[inputGasMeshIndex] as THREE.Mesh)
                .material as THREE.MeshPhongMaterial)
                .opacity = sampleRef.current.inputGasPedal ? 0.8 : 0.2;

            ((inputMeshRef.current.children[0].children[inputBrakeMeshIndex] as THREE.Mesh)
                .material as THREE.MeshPhongMaterial)
                .opacity = sampleRef.current.inputIsBraking ? 0.8 : 0.2;

            const rightSteerValue = sampleRef.current.inputSteer > 0 ? sampleRef.current.inputSteer : 0;
            ((inputMeshRef.current.children[0].children[inputRightMeshIndex] as THREE.Mesh)
                .scale.x = inputBaseScaleX * rightSteerValue);

            const leftSteerValue = sampleRef.current.inputSteer < 0 ? -sampleRef.current.inputSteer : 0;
            ((inputMeshRef.current.children[0].children[inputLeftMeshIndex] as THREE.Mesh)
                .scale.x = inputBaseScaleX * leftSteerValue);
        }
        /*
        if (sampleRef.current && gasMeshRef.current) {
            const isAccelerating = sampleRef.current.inputGasPedal;
            gasMeshRef.current.children.forEach((child: any) => {
                child.material.opacity = isAccelerating ? 0.6 : 0.2;
            });
        } */
    });

    return (
        /*
        <mesh
            ref={inputMeshRef}
            position={[0, 2, 0]}
            scale={0.1}
        >
            <SteerDirectionOverlay sampleRef={sampleRef} dir="left" getOffsetFunc={getOffsetXLeft} />
            <SteerDirectionOverlay sampleRef={sampleRef} dir="right" getOffsetFunc={getOffsetXRight} />
            <InputGasOverlay sampleRef={sampleRef} />
            <InputBrakeOverlay sampleRef={sampleRef} />
        </mesh>
        */
        <mesh
            ref={inputMeshRef}
            position={[0, 2, 0]}
        >
            <primitive
                object={overlayFbx}
            />
        </mesh>
    );
};

export default InputOverlay;
