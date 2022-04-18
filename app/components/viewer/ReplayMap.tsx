import React, {
    useRef, useState,
} from 'react';
import * as THREE from 'three';
import { useFBX } from '@react-three/drei';
import { Col, Row } from 'antd';

export interface ReplayMapProps {
    mapUrl: string;
    carFbx: THREE.Group;
}

const ReplayMap = ({
    mapUrl,
    carFbx,

}: ReplayMapProps): JSX.Element => {
    const mapFbx = useFBX('/spring_14.fbx');
    const mapMeshRef = useRef<THREE.Mesh>();

    const [position, setPosition] = useState<number[]>([750, 880, 710]);

    const [posIncrement, setPosIncrement] = useState<number>(1);

    const [selectedPosIndex, setSelectedPosIndex] = useState<number>(0);

    const mapMesh: THREE.Mesh = carFbx.children[0] as THREE.Mesh;
    const material: THREE.MeshPhongMaterial = mapMesh.material as THREE.MeshPhongMaterial;

    const matClone = material.clone();
    matClone.opacity = 0.7;

    matClone.color = new THREE.Color(
        0.1,
        0.1,
        0.1,
    );

    mapFbx.children.forEach((child: any) => {
        child.material = matClone;
    });
    mapFbx.traverse((children: THREE.Object3D) => {
        if (children instanceof THREE.Mesh) {
            children.castShadow = true;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'Tab') {
            if (selectedPosIndex > 1) {
                setSelectedPosIndex(0);
            } else {
                setSelectedPosIndex(selectedPosIndex + 1);
            }
            console.log('selectedPosIndex', selectedPosIndex + 1);
        }
        if (event.key === 'ArrowUp') {
            const newPos = [...position];
            newPos[selectedPosIndex] += posIncrement;
            setPosition(newPos);
            console.log('position', newPos);
        }
        if (event.key === 'ArrowDown') {
            const newPos = [...position];
            newPos[selectedPosIndex] -= posIncrement;
            setPosition(newPos);
            console.log('position', newPos);
        }
        if (event.key === 'ArrowLeft') {
            setPosIncrement(posIncrement / 2);
            console.log('posIncrement', posIncrement / 2);
        }
        if (event.key === 'ArrowRight') {
            setPosIncrement(posIncrement * 2);
            console.log('posIncrement', posIncrement * 2);
        }
    });

    return (
        <>
            <mesh
                position={new THREE.Vector3(position[0], position[1], position[2])}
            >
                <primitive
                    object={mapFbx}
                    dispose={null}
                    ref={mapMeshRef}
                    scale={0.01}

                />
            </mesh>
        </>
    );
};

export default ReplayMap;
