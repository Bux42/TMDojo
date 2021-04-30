import React from "react";
import * as THREE from "three";
import { BasicBlock, BasicBlockMaterial, MinimalBlockProps } from "./basicBlock";

const START_BLOCK_COLOR = new THREE.Color(0.2, 0.6, 0.2);
const FINISH_BLOCK_COLOR = new THREE.Color(0.6, 0.2, 0.2);
const CP_BLOCK_COLOR = new THREE.Color(0.1, 0.3, 0.8);

const LANDMARK_BLOCK_OPACITY = 0.8;

export const StartBlock = ({ meshCoord }: MinimalBlockProps): JSX.Element => {
    return (
        <BasicBlock
            meshCoord={meshCoord}
            color={START_BLOCK_COLOR}
            opacity={LANDMARK_BLOCK_OPACITY}
        />
    );
};

export const FinishBlock = ({ meshCoord }: MinimalBlockProps): JSX.Element => {
    return (
        <BasicBlock
            meshCoord={meshCoord}
            color={FINISH_BLOCK_COLOR}
            opacity={LANDMARK_BLOCK_OPACITY}
        />
    );
};

interface CpBlockProps {
    blockName: string;
    meshCoord: THREE.Vector3;
    dir: number;
}
export const CpBlock = ({ blockName, meshCoord, dir }: CpBlockProps): JSX.Element => {
    const isRingCp = blockName.includes("GateCheckpoint");

    if (isRingCp) {
        return <RingCpBlock meshCoord={meshCoord} dir={dir} opacity={LANDMARK_BLOCK_OPACITY} />;
    }

    return (
        <BasicBlock meshCoord={meshCoord} color={CP_BLOCK_COLOR} opacity={LANDMARK_BLOCK_OPACITY} />
    );
};

interface RingCpBlockProps extends MinimalBlockProps {
    dir: number;
    opacity: number;
}
export const RingCpBlock = ({ meshCoord, dir, opacity }: RingCpBlockProps): JSX.Element => {
    const ringMeshCoord = new THREE.Vector3(meshCoord.x, meshCoord.y + 16, meshCoord.z);

    const onUpdate = (geom: any) => {
        if (dir % 2 != 0) {
            geom.parent.rotation.y = Math.PI / 2;
        }
    };

    return (
        <mesh position={ringMeshCoord}>
            <torusBufferGeometry args={[16, 2, 16, 32]} onUpdate={onUpdate} />
            <BasicBlockMaterial color={CP_BLOCK_COLOR} opacity={opacity} />
        </mesh>
    );
};
