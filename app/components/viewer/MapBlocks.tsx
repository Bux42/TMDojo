import React, { useContext, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import {
    DoubleSide,
    Group, Mesh, MeshPhongMaterial, Object3D, Vector3,
} from 'three';
import { Billboard, Sphere, Text } from '@react-three/drei';
import { Block, MapBlockData } from '../../lib/blocks/blockData';
import { BasicBlock, BasicBlockWithOffsets } from './blocks/BasicBlocks';
import { CpBlock } from './blocks/CpBlocks';
import { BLOCK_SIZE } from '../../lib/constants/block';
import { SettingsContext } from '../../lib/contexts/SettingsContext';
import BlockNames from './blocks/BlockNames';

// Block colors
const BASE_COLOR = new THREE.Color(0.1, 0.1, 0.1);
const START_COLOR = new THREE.Color(0.2, 0.6, 0.2);
const FINISH_COLOR = new THREE.Color(0.6, 0.2, 0.2);
const CP_COLOR = new THREE.Color(0.1, 0.3, 1);
const WATER_COLOR = new THREE.Color(0, 0, 1);
const GRASS_COLOR = new THREE.Color(0, 1, 0);

// Block opacities
const BASE_OPACITY = 0.05;
const START_OPACITY = 0.8;
const FINISH_OPACITY = 0.8;
const CP_OPACITY = 0.8;
const WATER_OPACITY = 1;

interface MapBlockProps {
    block: Block;
}
const MapBlock = ({ block }: MapBlockProps) => {
    const [hasModel, setHasModel] = useState(true);
    const [models, setModels] = useState<Object3D[] | null>(null);

    const { blockName, baseCoord } = block;

    // Offset coord by -8 in the Y-direction so all blocks are below the race line
    const meshCoord = new THREE.Vector3(baseCoord.x, baseCoord.y - 8, baseCoord.z);

    const tryToLoadBlockModel = async (): Promise<void> => {
        try {
            const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader');
            const objPath = `/objs/${block.blockName}.obj`;

            const loader = new OBJLoader();
            loader.load(objPath, (group: Group) => {
                if (group.children.length > 0) {
                    setModels([group.children[0]]);
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
                        <mesh
                            position={modelCoord}
                        >
                            <Sphere />
                        </mesh>
                        <mesh
                            position={positionWithOffset}
                        >
                            <mesh
                                rotation={[0, (Math.PI / 2) * (4 - ((block.dir) % 4)), 0]}
                            >
                                <meshPhongMaterial />
                                <primitive
                                    object={model}
                                />
                            </mesh>
                        </mesh>
                    </>
                ))}
            </>
        );
    }

    // Start block
    if (blockName.includes('TechStart')) {
        return (
            <BasicBlock
                meshCoord={meshCoord}
                materialProps={{ color: START_COLOR, opacity: START_OPACITY }}
            />
        );
    }

    // Finish blocks
    if (blockName.includes('TechFinish')) {
        return (
            <BasicBlock
                meshCoord={meshCoord}
                materialProps={{ color: FINISH_COLOR, opacity: FINISH_OPACITY }}
            />
        );
    }

    // Checkpoint blocks
    if (blockName.includes('Checkpoint')) {
        return (
            <CpBlock
                block={block}
                meshCoord={meshCoord}
                materialProps={{ color: CP_COLOR, opacity: CP_OPACITY }}
            />
        );
    }

    // Water blocks
    if (blockName.includes('WaterBase')) {
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

const filterBlocks = (blocks: Block[]): Block[] => blocks.filter((block) => {
    const { blockName, baseCoord } = block;

    if (baseCoord.y === 12 && blockName.includes('Grass')) {
        return false;
    }

    const blockBlacklist = [
        'Pillar',
        'Deco',
        'Stage',
        'Light',
        'Technics',
        'Structure',
        'PlatformGrassWallOutCurve',
        'TrackWallCurve',
    ];

    const isBlacklisted = blockBlacklist.some((blacklistedBlock) => blockName.includes(blacklistedBlock));

    return !isBlacklisted;
});

interface Props {
    mapBlockData: MapBlockData;
}
const MapBlocks = ({ mapBlockData }: Props): JSX.Element => {
    const filteredBlocks = filterBlocks(mapBlockData.blocks);

    return (
        <>
            {filteredBlocks.map((block, i) => (
                <>
                    <BlockNames block={block} blockOffsetNames />
                    <MapBlock key={i} block={block} />
                </>
            ))}
        </>
    );
};

export default MapBlocks;
