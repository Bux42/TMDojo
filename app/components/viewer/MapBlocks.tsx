import React from 'react';
import * as THREE from 'three';
import { Block, MapBlockData } from '../../lib/blocks/blockData';
import { BasicBlock, BasicBlockWithOffsets } from './blocks/BasicBlocks';
import { CpBlock } from './blocks/CpBlocks';

// Block colors
const BASE_COLOR = new THREE.Color(0.1, 0.1, 0.1);
const START_COLOR = new THREE.Color(0.2, 0.6, 0.2);
const FINISH_COLOR = new THREE.Color(0.6, 0.2, 0.2);
const CP_COLOR = new THREE.Color(0.1, 0.3, 0.8);

// Block opacities
const BASE_OPACITY = 0.2;
const START_OPACITY = 0.8;
const FINISH_OPACITY = 0.8;
const CP_OPACITY = 0.8;

interface MapBlockProps {
    block: Block;
}
const MapBlock = ({ block }: MapBlockProps) => {
    const { blockName, baseCoord } = block;

    // Offset coord by -8 in the Y-direction so all blocks are below the race line
    const meshCoord = new THREE.Vector3(baseCoord.x, baseCoord.y - 8, baseCoord.z);

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

    if (baseCoord.y == 12 && blockName.includes('Grass')) {
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
            {filteredBlocks.map((block, i) => <MapBlock key={i} block={block} />)}
        </>
    );
};

export default MapBlocks;
