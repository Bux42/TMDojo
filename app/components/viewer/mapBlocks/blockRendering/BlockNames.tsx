import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { DoubleSide } from 'three';
import { Block } from '../../../../lib/mapBlocks/mapBlockData';

interface BlockNameProps {
    position: THREE.Vector3;
    name: string;
    fontSize: number;
    fontColor: string;
}
export const BlockName = ({
    position, name, fontSize, fontColor,
}: BlockNameProps) => (
    <Billboard
        args={[0, 0]}
        position={position}
    >
        <Text
            color={fontColor}
            fontSize={fontSize}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign="left"
            font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
            anchorX="center"
            anchorY="middle"
        >
            <meshBasicMaterial attach="material" side={DoubleSide} color="red" />
            {name}
        </Text>
    </Billboard>
);

interface BlockNamesProps {
    block: Block;
    blockOffsetNames: boolean;
}
const BlockNames = ({ block, blockOffsetNames }: BlockNamesProps) => {
    const meshCoord = new THREE.Vector3().add(block.pos).add(new THREE.Vector3(0, -8, 0));

    return (
        <>
            <BlockName
                position={meshCoord}
                name={block.name}
                fontSize={2}
                fontColor="red"
            />

            {blockOffsetNames && block.blockOffsets.map((offset, i) => {
                if (offset.x === 0 && offset.y === 0 && offset.z === 0) {
                    return null;
                }

                const offsetCoord = new THREE.Vector3().addVectors(
                    meshCoord,
                    new THREE.Vector3(offset.x * 32, offset.y * 8, offset.z * 32),
                );

                return (
                    <BlockName
                        position={offsetCoord}
                        name={`[${i + 1}/${block.blockOffsets.length}] - ${block.name}`}
                        fontSize={1.3}
                        fontColor="pink"
                    />
                );
            })}
        </>

    );
};

export default BlockNames;
