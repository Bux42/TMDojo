/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import * as THREE from 'three';
import { Block } from '../../../../lib/mapBlocks/blockData';
import { BasicBlock, BasicBlockMaterial, BasicBlockProps } from './BasicBlocks';

interface CpBlockProps extends BasicBlockProps {
    block: Block;
}
export const CpBlock = (props: CpBlockProps): JSX.Element => {
    const isRingCp = props.block.blockName.includes('GateCheckpoint');

    return isRingCp ? <RingCpBlock {...props} /> : <BasicBlock {...props} />;
};

export const RingCpBlock = ({ block, meshCoord, materialProps }: CpBlockProps): JSX.Element => {
    const ringMeshCoord = new THREE.Vector3(meshCoord.x, meshCoord.y + 24, meshCoord.z);

    const onUpdate = (geom: any) => {
        if (block.dir % 2 != 0) {
            geom.parent.rotation.y = Math.PI / 2;
        }
    };

    return (
        <mesh position={ringMeshCoord}>
            <torusBufferGeometry args={[16, 2, 16, 32]} onUpdate={onUpdate} />
            <BasicBlockMaterial {...materialProps} />
        </mesh>
    );
};
