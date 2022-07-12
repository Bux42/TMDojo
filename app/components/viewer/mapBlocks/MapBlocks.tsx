import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import {
    BufferGeometry, Euler, Group, Vector3,
} from 'three';
import { AnchoredObject, Block, MapBlockData } from '../../../lib/mapBlocks/mapBlockData';
import calcBlockCoord from '../../../lib/mapBlocks/blockCalculations';
import {
    START_COLOR, CP_COLOR, FINISH_COLOR, FREEWHEEL_COLOR, BASE_COLOR,
} from '../../../lib/mapBlocks/blockConstants';
import { BlockName } from './blockRendering/BlockNames';

const filterBlocks = (blocks: Block[]): Block[] => blocks.filter((block) => {
    const { name, pos } = block;

    if (pos.y === 12 && name.includes('Grass')) {
        return false;
    }

    const blockBlacklist: string[] = [
        // 'Pillar',
        // 'Deco',
        // 'Stage',
        // 'Light', //
        // 'Technics', //
        // 'Structure', //
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
    return BASE_COLOR;
};

interface BlockInstancesProps {
    blockName: string;
    blocks: Block[];
}
const BlockInstances = ({ blockName, blocks }: BlockInstancesProps) => {
    if (blocks.length === 0) {
        return <></>;
    }

    const [geometry, setGeometry] = useState<BufferGeometry | null>(null);

    const tryToLoadBlockModel = async (): Promise<void> => {
        try {
            const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader');
            const { BufferGeometryUtils } = await import('three/examples/jsm/utils/BufferGeometryUtils');

            const objPath = `/objs/${blockName}.obj`;
            const loader = new OBJLoader();
            loader.load(objPath, (group: Group) => {
                const mergedGeometry = BufferGeometryUtils
                    .mergeBufferGeometries(group.children.map((model) => (model as THREE.Mesh).geometry));

                setGeometry(mergedGeometry);
            });
        } catch (e) {
            // Failed to load model, do nothing, falls back to normal cube rendering
        }
    };

    useEffect(() => {
        if (blocks.length === 0) {
            return;
        }

        tryToLoadBlockModel();
    }, [blocks]);

    return (
        <>
            {blocks.map((block) => {
                const blockColor = getBlockColor(block.name);
                const position = calcBlockCoord(block);
                return (
                    geometry ? (
                        <mesh position={position}>
                            <mesh rotation={[0, (Math.PI / 2) * (4 - ((block.dir) % 4)), 0]}>
                                <mesh geometry={geometry}>
                                    {/* <meshNormalMaterial side={THREE.DoubleSide} /> */}
                                    {
                                        blockColor
                                            ? <meshStandardMaterial side={THREE.DoubleSide} color={blockColor} />
                                            : <meshNormalMaterial side={THREE.DoubleSide} />
                                    }
                                </mesh>
                            </mesh>
                        </mesh>
                    ) : (
                        null
                    )
                );
            })}
        </>
    );
};

// Basic block component for regular box-shaped blocks
export interface AnchoredObjectVisualizationProps {
    anchoredObject: AnchoredObject;
}
export const AnchoredObjectVisualization = ({ anchoredObject }: AnchoredObjectVisualizationProps): JSX.Element => (
    <>
        <mesh
            position={anchoredObject.pos}
            rotation={new Euler(anchoredObject.pitch, anchoredObject.yaw, anchoredObject.roll, 'YXZ')}
        >
            <coneGeometry args={[1, 2, 32]} />
            <meshBasicMaterial color="red" />
        </mesh>
        <mesh
            position={anchoredObject.pos}
            rotation={new Euler(anchoredObject.pitch, anchoredObject.yaw, anchoredObject.roll, 'YXZ')}
        >
            <circleGeometry args={[1.5, 32]} />
            <meshBasicMaterial color="blue" />
        </mesh>
        <BlockName
            name={anchoredObject.name}
            position={anchoredObject.pos.clone().add(new Vector3(0, 2, 0))}
            fontSize={1}
            fontColor="black"
        />
    </>
);

interface Props {
    mapBlockData: MapBlockData;
}
const MapBlocks = ({ mapBlockData }: Props): JSX.Element => {
    const filteredBlocks = useMemo(() => filterBlocks(mapBlockData.nadeoBlocks), [mapBlockData]);

    type GroupedBlocks = {
        [key: string]: Block[] | undefined
    }
    const blocksGroupedByName = useMemo(() => filteredBlocks.reduce(
        (blocks: GroupedBlocks, block: Block) => ({
            ...blocks,
            [block.name]: [...(blocks[block.name] || []), block],
        }),
        {},
    ), [filteredBlocks]);

    return (
        <>
            {Object.keys(blocksGroupedByName).map((blockName: string) => {
                const blocks = blocksGroupedByName[blockName];

                if (!blocks || blocks.length === 0) {
                    return null;
                }

                return (
                    <BlockInstances
                        key={blockName}
                        blockName={blockName}
                        blocks={blocks}
                    />
                );
            })}

            {
                mapBlockData.anchoredObjects.map((anchoredObject: AnchoredObject) => (
                    <AnchoredObjectVisualization key={anchoredObject.name} anchoredObject={anchoredObject} />
                ))
            }
            {/*
            {filteredBlocks.map((block, i) => (
                <>
                    <BlockNames block={block} blockOffsetNames />
                    <MapBlock key={i} block={block} />
                </>
            ))}
            */}
        </>
    );
};

export default MapBlocks;
