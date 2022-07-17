import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Euler } from 'three';
import {
    AnchoredObject, Block, FreeModeBlock, MapBlockData,
} from '../../../lib/mapBlocks/mapBlockData';
import calcBlockCoord from '../../../lib/mapBlocks/blockCalculations';
import {
    START_COLOR, CP_COLOR, FINISH_COLOR, FREEWHEEL_COLOR,
} from '../../../lib/mapBlocks/blockConstants';
import { Transform } from './blockRendering/Instances';
import InstancedModels from './blockRendering/InstancedModels';

const filterNadeoBlocks = (blocks: Block[]): Block[] => blocks.filter((block) => {
    const { name, pos } = block;

    if (pos.y === 12 && name.includes('Grass')) {
        return false;
    }

    const blockBlacklist: string[] = [
        // 'Pillar',
        // 'Deco',
        // 'Stage',
        // 'Light',
        // 'Technics',
        // 'Structure',
        // 'PlatformGrassWallOutCurve',
        // 'TrackWallCurve',
    ];

    const isBlacklisted = blockBlacklist.some((blacklistedBlock) => name.includes(blacklistedBlock));

    return !isBlacklisted;
});

const getBlockColor = (blockName: string) => {
    if (blockName.includes('TechStart') || blockName.includes('BumpStart') || blockName.includes('RoadDirtStart')) {
        return START_COLOR;
    } if (blockName.includes('Checkpoint')) {
        return CP_COLOR;
    } if (blockName.includes('Finish')) {
        return FINISH_COLOR;
    } if (blockName.includes('SpecialNoEngine')) {
        return FREEWHEEL_COLOR;
    }
    return undefined;
};

const nadeoBlockToTransform = (block: Block): Transform => ({
    pos: calcBlockCoord(block),
    rot: new Euler(0, (Math.PI / 2) * (4 - ((block.dir) % 4)), 0),
});

const freeModeBlockToTransform = (block: FreeModeBlock): Transform => ({
    pos: block.pos,
    rot: block.rot,
});

const anchoredObjectToTransform = (anchoredObject: AnchoredObject): Transform => ({
    pos: anchoredObject.pos,
    rot: new Euler(anchoredObject.pitch, anchoredObject.yaw, anchoredObject.roll, 'YXZ'),
});

interface Props {
    mapBlockData: MapBlockData;
}
const MapBlocks = ({ mapBlockData }: Props): JSX.Element => {
    const blockTransformsGrouped = useMemo(() => {
        const groupedBlocks = new Map<string, Transform[]>();

        filterNadeoBlocks(mapBlockData.nadeoBlocks).forEach((block: Block) => {
            const transform = nadeoBlockToTransform(block);
            const blockName = block.name;
            groupedBlocks.set(blockName, [...(groupedBlocks.get(blockName) || []), transform]);
        });
        mapBlockData.freeModeBlocks.forEach((block: FreeModeBlock) => {
            const transform = freeModeBlockToTransform(block);
            const blockName = block.name;
            groupedBlocks.set(blockName, [...(groupedBlocks.get(blockName) || []), transform]);
        });

        return groupedBlocks;
    }, [mapBlockData]);

    const anchoredItemsTransformsGrouped = useMemo(() => {
        const groupedBlocks = new Map<string, Transform[]>();

        mapBlockData.anchoredObjects.forEach((anchoredObject: AnchoredObject) => {
            const transform = anchoredObjectToTransform(anchoredObject);
            const { name } = anchoredObject;
            groupedBlocks.set(name, [...(groupedBlocks.get(name) || []), transform]);
        });

        return groupedBlocks;
    }, [mapBlockData]);

    return (
        <>
            {Array.from(blockTransformsGrouped.keys()).map((blockName: string) => {
                const transforms = blockTransformsGrouped.get(blockName);

                if (!transforms || transforms.length === 0) {
                    return null;
                }

                const color = getBlockColor(blockName);

                return (
                    <InstancedModels
                        key={blockName}
                        modelName={blockName}
                        transforms={transforms}
                        material={(
                            <meshStandardMaterial
                                color={color || new THREE.Color(0.1, 0.1, 0.1)}
                                roughness={0.4}
                            />
                        )}
                    />
                );
            })}

            {Array.from(anchoredItemsTransformsGrouped.keys()).map((objectName: string) => {
                const transforms = anchoredItemsTransformsGrouped.get(objectName);

                if (!transforms || transforms.length === 0) {
                    return null;
                }

                return (
                    <InstancedModels
                        key={objectName}
                        modelName={`extracted/${objectName}`}
                        transforms={transforms}
                        material={(<meshStandardMaterial color={new THREE.Color(0.1, 0.1, 0.1)} />)}
                        fallbackGeometry={new THREE.ConeBufferGeometry(1, 2, 32)}
                        fallbackMaterial={(<meshStandardMaterial color={new THREE.Color(0.2, 0.2, 0.9)} />)}
                    />
                );
            })}
        </>
    );
};

export default MapBlocks;
