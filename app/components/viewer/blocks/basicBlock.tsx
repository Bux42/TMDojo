import React from "react";
import * as THREE from "three";

export const BASE_BLOCK_COLOR = new THREE.Color(0.1, 0.1, 0.1);
export const BASE_BLOCK_OPACITY = 0.3;

export interface BlockMaterialProps {
    color: THREE.Color;
    opacity: number;
}
export const BasicBlockMaterial = ({ color, opacity }: BlockMaterialProps): JSX.Element => (
    <meshPhongMaterial color={color} opacity={opacity} transparent />
);

export interface MinimalBlockProps {
    meshCoord: THREE.Vector3;
}
export interface BasicBlockProps extends MinimalBlockProps, BlockMaterialProps {}
export const BasicBlock = ({ meshCoord, color, opacity }: BasicBlockProps): JSX.Element => {
    return (
        <mesh position={meshCoord}>
            <boxBufferGeometry args={[32, 8, 32]} />
            <BasicBlockMaterial color={color} opacity={opacity} />
        </mesh>
    );
};
