import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Group, Object3D, Vector3 } from 'three';
import { Block } from '../../../../lib/mapBlocks/mapBlockData';
import { BLOCK_SIZE } from '../../../../lib/constants/block';
import { BasicBlock, BasicBlockWithOffsets } from './BasicBlocks';
import {
    BASE_COLOR,
    BASE_OPACITY,
    CP_COLOR,
    CP_OPACITY,
    FINISH_COLOR,
    FINISH_OPACITY,
    START_COLOR,
    START_OPACITY,
    WATER_COLOR,
    WATER_OPACITY,
} from '../../../../lib/mapBlocks/blockConstants';
import { CpBlock } from './CpBlocks';

interface MapBlockProps {
    block: Block;
    color?: THREE.Color;
}
const MapBlock = ({ block, color }: MapBlockProps) => {
    const [models, setModels] = useState<Object3D[] | null>(null);

    const { name, pos } = block;

    // Offset coord by -8 in the Y-direction so all blocks are below the race line
    const meshCoord = new THREE.Vector3(pos.x, pos.y - 8, pos.z);

    const tryToLoadBlockModel = async (): Promise<void> => {
        try {
            const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader');
            const objPath = `/objs/${name}.obj`;

            const loader = new OBJLoader();
            loader.load(objPath, (group: Group) => {
                if (group.children.length > 0) {
                    // setModels([group.children[0]]);
                    setModels(group.children);
                }
            });
        } catch (e) {
            // Failed to load model, do nothing, falls back to normal cube rendering
        }
    };

    useEffect(() => {
        tryToLoadBlockModel();
    }, []);

    if (models != null) {
        const maxX = Math.max(...block.blockOffsets.map((offset) => offset.x)) * BLOCK_SIZE.x + BLOCK_SIZE.x;
        const maxZ = Math.max(...block.blockOffsets.map((offset) => offset.z)) * BLOCK_SIZE.z + BLOCK_SIZE.z;

        const modelCoord = new Vector3().add(meshCoord).add(new Vector3(
            -BLOCK_SIZE.x / 2,
            BLOCK_SIZE.y / 2,
            -BLOCK_SIZE.z / 2,
        ));

        const positionWithOffset = new Vector3().add(modelCoord).add(new Vector3(
            (block.dir === 1 || block.dir === 2) ? maxX : 0,
            0,
            (block.dir === 2 || block.dir === 3) ? maxZ : 0,
        ));

        return (
            <>
                {models.map((model) => (
                    <>
                        {/* <mesh
                            position={modelCoord}
                        >
                            <Sphere />
                        </mesh> */}
                        <mesh
                            position={positionWithOffset}
                        >
                            <mesh
                                rotation={[0, (Math.PI / 2) * (4 - ((block.dir) % 4)), 0]}
                            >
                                <primitive object={model}>
                                    {/* <meshNormalMaterial side={THREE.DoubleSide} /> */}
                                    <meshStandardMaterial side={THREE.DoubleSide} color={color} />
                                </primitive>
                            </mesh>
                        </mesh>
                    </>
                ))}
            </>
        );
    }

    // Start block
    if (name.includes('TechStart')) {
        return (
            <BasicBlock
                meshCoord={meshCoord}
                materialProps={{ color: START_COLOR, opacity: START_OPACITY }}
            />
        );
    }

    // Finish blocks
    if (name.includes('TechFinish')) {
        return (
            <BasicBlock
                meshCoord={meshCoord}
                materialProps={{ color: FINISH_COLOR, opacity: FINISH_OPACITY }}
            />
        );
    }

    // Checkpoint blocks
    if (name.includes('Checkpoint')) {
        return (
            <CpBlock
                block={block}
                meshCoord={meshCoord}
                materialProps={{ color: CP_COLOR, opacity: CP_OPACITY }}
            />
        );
    }

    // Water blocks
    if (name.includes('WaterBase')) {
        return (
            <BasicBlock
                meshCoord={meshCoord}
                materialProps={{ color: WATER_COLOR, opacity: WATER_OPACITY }}
            />
        );
    }

    return (
        <BasicBlockWithOffsets
            meshCoord={meshCoord}
            block={block}
            materialProps={{ color: BASE_COLOR, opacity: BASE_OPACITY }}
        />
    );
};
