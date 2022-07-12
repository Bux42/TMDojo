/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import * as THREE from 'three';
import { Block } from '../../../../lib/mapBlocks/blockData';

// Material component for blocks
export interface BlockMaterialProps {
    color: THREE.Color;
    opacity: number;
}
export const BasicBlockMaterial = (props: BlockMaterialProps): JSX.Element => (
    <meshPhongMaterial {...props} transparent={props.opacity < 1} />
);

// Basic block component for regular box-shaped blocks
export interface BasicBlockProps {
    meshCoord: THREE.Vector3;
    materialProps: BlockMaterialProps;
}
export const BasicBlock = ({ meshCoord, materialProps }: BasicBlockProps): JSX.Element => (
    <mesh position={meshCoord}>
        <boxBufferGeometry args={[32, 8, 32]} />
        <BasicBlockMaterial {...materialProps} />
    </mesh>
);

// Block component that renders all blocks at base and offset positions
export interface BasicBlockWithOffsetsProps extends BasicBlockProps {
    block: Block;
}
export const BasicBlockWithOffsets = ({
    block,
    meshCoord,
    materialProps,
}: BasicBlockWithOffsetsProps): JSX.Element => (
    <>
        {block.blockOffsets.map((offset, i) => {
            const offsetCoord = new THREE.Vector3().addVectors(
                meshCoord,
                new THREE.Vector3(offset.x * 32, offset.y * 8, offset.z * 32),
            );

            return (
                <BasicBlock
                    key={`${block.blockName}-${i}`}
                    meshCoord={offsetCoord}
                    materialProps={materialProps}
                />
            );
        })}
    </>
);
