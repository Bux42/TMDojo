import React, {
    useCallback, useEffect, useMemo, useState,
} from 'react';
import * as THREE from 'three';
import {
    BoxBufferGeometry, BufferGeometry, Euler, Vector3,
} from 'three';
import {
    AnchoredObject, Block, FreeModeBlock, MapBlockData,
} from '../../../lib/mapBlocks/mapBlockData';
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

const tryCreatePrimitiveModel = (modelName: string): BufferGeometry | undefined => {
    if (modelName === 'DecoWallBasePillar'
        || modelName === 'WaterWallPillar'
        || modelName === 'TrackWallStraightPillar') {
        // TODO: Optimize geometry creation, getting instantiated for each block
        const boxGeom = new BoxBufferGeometry(32, 8, 32);
        boxGeom.translate(16, 4, 16);
        return boxGeom;
    }

    if (modelName === 'StructurePillar') {
        // TODO: Optimize geometry creation, getting instantiated for each block
        const structurePillar = new BoxBufferGeometry(3, 8, 3);
        structurePillar.translate(16, 4, 16);
        return structurePillar;
    }

    return undefined;
};

const tryFetchModel = async (modelName: string): Promise<BufferGeometry | undefined> => {
    const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader');
    const { BufferGeometryUtils } = await import('three/examples/jsm/utils/BufferGeometryUtils');

    const objPath = `/objs/${modelName}.obj`;
    const loader = new OBJLoader();

    try {
        const group = await loader.loadAsync(objPath);

        const geometries = group.children.map((model) => (model as THREE.Mesh).geometry);

        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);

        return mergedGeometry;
    } catch (e) {
        // Model load failed, model could be do nothing
        // TODO: Only catch errors of models not found. Currently ignores all other errors too
    }

    // If there's no mesh, try to create primitive models for some simple blocks as backup
    const primitiveModel = tryCreatePrimitiveModel(modelName);
    if (primitiveModel) {
        return primitiveModel;
    }

    return undefined;
};

// TODO: Generalize interfaces to share between block and item rendering:
// interface Transform {
//     position: Vector3;
//     rotation: Euler;
// }
// interface ModelsVisualizionProps {
//     modelName: string;
//     transforms: Transform[],
//     children?: React.ReactNode;
//     fallback?: React.ReactNode;
// }

interface SingleModelVisProps {
    modelName: string;
    position: Vector3,
    rotation?: Euler;
    children?: React.ReactNode;
    fallbackComponent?: React.ReactNode;
}
const SingleModelMesh = ({
    modelName, position, rotation, children, fallbackComponent,
}: SingleModelVisProps) => {
    const [geometry, setGeometry] = useState<BufferGeometry | null>(null);

    const tryLoadModel = useCallback(async (): Promise<void> => {
        const model = await tryFetchModel(modelName);
        if (!model) return;
        setGeometry(model);
    }, [modelName, setGeometry]);

    useEffect(
        () => { tryLoadModel(); },
        [modelName, setGeometry, tryLoadModel],
    );

    return (
        <>
            {geometry ? (
                <mesh
                    geometry={geometry}
                    position={position}
                    rotation={rotation}
                    castShadow
                    receiveShadow
                >
                    {children || (
                        <meshStandardMaterial
                            color={getBlockColor(modelName) || new THREE.Color(0.1, 0.1, 0.1)}
                            roughness={0.4}
                        />
                    )}
                </mesh>
            ) : (
                fallbackComponent || null
            )}
        </>
    );
};

interface MultipleBlockModelsProps {
    modelName: string;
    blocks: Block[];
}
const MultipleBlockModels = ({ modelName, blocks }: MultipleBlockModelsProps) => {
    const [geometry, setGeometry] = useState<BufferGeometry | null>(null);

    const tryLoadModel = useCallback(async (): Promise<void> => {
        const model = await tryFetchModel(modelName);
        if (!model) return;
        setGeometry(model);
    }, [modelName, setGeometry]);

    useEffect(
        () => { tryLoadModel(); },
        [modelName, setGeometry, tryLoadModel],
    );

    return (
        <>
            {blocks.map((block) => {
                const blockColor = getBlockColor(block.name);
                const position = calcBlockCoord(block);
                const rotation = new Euler(0, (Math.PI / 2) * (4 - ((block.dir) % 4)), 0);
                return geometry ? (
                    <>
                        <mesh
                            position={position}
                            rotation={rotation}
                            geometry={geometry}
                            castShadow
                            receiveShadow
                        >
                            <meshStandardMaterial
                                color={blockColor || new THREE.Color(0.1, 0.1, 0.1)}
                                roughness={0.4}
                            />
                        </mesh>
                    </>
                ) : (
                    null
                );
            })}
        </>
    );
};

// Basic block component for regular box-shaped blocks
export interface AnchoredObjectMeshProps {
    anchoredObject: AnchoredObject;
}
export const AnchoredObjectMesh = ({ anchoredObject }: AnchoredObjectMeshProps): JSX.Element => (
    <>
        <SingleModelMesh
            modelName={`extracted/${anchoredObject.name}`}
            position={anchoredObject.pos}
            rotation={new Euler(anchoredObject.pitch, anchoredObject.yaw, anchoredObject.roll, 'YXZ')}
            fallbackComponent={(
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
                    {/* <BlockName
                        name={anchoredObject.name}
                        position={anchoredObject.pos.clone().add(new Vector3(0, 2, 0))}
                        fontSize={1}
                        fontColor="black"
                    /> */}
                </>
            )}
        >
            <meshNormalMaterial side={THREE.DoubleSide} />
            {/* {
                    blockColor
                        ? <meshStandardMaterial side={THREE.DoubleSide} color={blockColor} />
                        : <meshNormalMaterial side={THREE.DoubleSide} />
                } */}
        </SingleModelMesh>
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
                    <MultipleBlockModels
                        key={blockName}
                        modelName={blockName}
                        blocks={blocks}
                    />
                );
            })}

            {mapBlockData.anchoredObjects.map((anchoredObject: AnchoredObject, i: number) => (
                <AnchoredObjectMesh
                    key={`anchored-${anchoredObject.name}-${i}`}
                    anchoredObject={anchoredObject}
                />
            ))}

            {mapBlockData.freeModeBlocks.map((block: FreeModeBlock, i: number) => (
                <>
                    <SingleModelMesh
                        key={`freemode-${block.name}-${i}`}
                        modelName={block.name}
                        position={block.pos}
                        rotation={block.rot}
                    />
                </>
            ))}
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
