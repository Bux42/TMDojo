import React, {
    Fragment, useEffect, useMemo, useState,
} from 'react';
import * as THREE from 'three';
import { Euler } from 'three';
import {
    MTLLoader, OBJLoader,
} from 'three-stdlib';
import { Billboard, Text } from '@react-three/drei';
import {
    AnchoredObject, Block, FreeModeBlock, MapBlockData,
} from '../../../lib/mapBlocks/mapBlockData';
import calcBlockCoord from '../../../lib/mapBlocks/blockCalculations';
import {
    START_COLOR, CP_COLOR, FINISH_COLOR, FREEWHEEL_COLOR,
} from '../../../lib/mapBlocks/blockConstants';
import { Transform } from './blockRendering/Instances';
import { BLOCK_SIZE } from '../../../lib/constants/block';
import InstancedModels from './blockRendering/InstancedModels';

const depthFunc = THREE.LessEqualDepth;
const shadowOpacity = 0.4;

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

interface TransformWithBlock {
    transform: Transform;
    block: Block | FreeModeBlock;
}
interface Props {
    mapBlockData: MapBlockData;
}

interface BlockWithTextureProps {
    block: Block;
}

const BlockWithTexture = ({ block }: BlockWithTextureProps): JSX.Element => {
    const [objectGroup, setObjectGroup] = useState<THREE.Group>();
    const [position, setPosition] = useState(new THREE.Vector3(0, 0, 0));

    const transform = nadeoBlockToTransform(block);

    useEffect(() => {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        mtlLoader.load(`/objs/${block.name}.mtl`, (materials) => {
            materials.preload();
            objLoader.setMaterials(materials);

            objLoader.load(
                `/objs/${block.name}.obj`,
                (object) => {
                    const meshCoord = new THREE.Vector3(block.pos.x, block.pos.y - 8, block.pos.z);

                    const modelCoord = new THREE.Vector3(0, 0, 0).add(meshCoord).add(
                        new THREE.Vector3(
                            -BLOCK_SIZE.x / 2,
                            BLOCK_SIZE.y / 2,
                            -BLOCK_SIZE.z / 2,
                        ),
                    ) as THREE.Vector3;

                    const maxX = Math.max(
                        ...block.blockOffsets.map((offset) => offset.x),
                    ) * BLOCK_SIZE.x + BLOCK_SIZE.x;
                    const maxY = Math.max(
                        ...block.blockOffsets.map((offset) => offset.z),
                    ) * BLOCK_SIZE.z + BLOCK_SIZE.z;

                    const positionWithOffset = new THREE.Vector3(0, 0, 0).add(modelCoord).add(new THREE.Vector3(
                        (block.dir === 1 || block.dir === 2) ? maxX : 0,
                        0,
                        (block.dir === 2 || block.dir === 3) ? maxY : 0,
                    ));
                    setPosition(positionWithOffset);
                    setObjectGroup(object);
                },
            );
        });
    }, [block.blockOffsets, block.dir, block.name, block.pos.x, block.pos.y, block.pos.z]);

    return (
        <>
            {objectGroup ? (
                <>
                    <mesh position={position} rotation={transform.rot}>
                        <primitive object={objectGroup}>
                            <meshBasicMaterial attach="material" />
                        </primitive>
                    </mesh>
                </>
            ) : (
                <Billboard
                    position={new THREE.Vector3().addVectors(
                        block.pos,
                        new THREE.Vector3(0, 5, 0),
                    )}
                    args={[0, 0]}
                >
                    <Text
                        color={new THREE.Color(0xffffff)}
                        fontSize={5}
                        maxWidth={200}
                        lineHeight={1}
                        letterSpacing={0.02}
                        textAlign="left"
                        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        <meshBasicMaterial attach="material" side={THREE.DoubleSide} color="red" />
                        {block.name}
                    </Text>
                </Billboard>
            )}
        </>
    );
};

const MapBlocks = ({ mapBlockData }: Props): JSX.Element => {
    const blockTransformsGrouped = useMemo(() => {
        const groupedBlocks = new Map<string, TransformWithBlock[]>();

        filterNadeoBlocks(mapBlockData.nadeoBlocks).forEach((block: Block) => {
            const transform = nadeoBlockToTransform(block);
            const blockName = block.name;
            groupedBlocks.set(blockName, [...(groupedBlocks.get(blockName) || []), { transform, block }]);
        });
        mapBlockData.freeModeBlocks.forEach((block: FreeModeBlock) => {
            const transform = freeModeBlockToTransform(block);
            const blockName = block.name;
            groupedBlocks.set(blockName, [...(groupedBlocks.get(blockName) || []), { transform, block }]);
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
            {/* {
                mapBlockData.nadeoBlocks.map((block: Block) => <BlockWithTexture block={block} />)
            } */}
            {Array.from(blockTransformsGrouped.keys()).map((blockName: string) => {
                const transforms = blockTransformsGrouped.get(blockName);

                if (!transforms || transforms.length === 0) {
                    return null;
                }

                const color = getBlockColor(blockName);

                return (
                    <Fragment key={`${blockName}-instances`}>
                        {/* Temporarily remove shadow instances */}
                        {/* <InstancedModels
                            // key={`${blockName}-shadow`}
                            // modelName={blockName}
                            // transforms={transforms.map(({ transform }) => transform)}
                        // material={(
                        //     <shadowMaterial
                        //         transparent
                        //         opacity={shadowOpacity}
                        //         depthFunc={depthFunc}
                        //     />
                        // )}
                        // /> */}
                        <InstancedModels
                            key={`${blockName}-block-instances`}
                            modelName={blockName}
                            transforms={transforms.map(({ transform }) => transform)}
                        // material={(
                        //     <meshStandardMaterial
                        //         color={color || new THREE.Color(0.1, 0.1, 0.1)}
                        //         roughness={0.4}
                        //         depthFunc={depthFunc}
                        //     />
                        // )}
                        />
                    </Fragment>
                );
            })}

            {/* Array.from(anchoredItemsTransformsGrouped.keys()).map((objectName: string) => {
                const transforms = anchoredItemsTransformsGrouped.get(objectName);

                if (!transforms || transforms.length === 0) {
                    return null;
                }

                return (
                    <>
                        <InstancedModels
                            key={`${objectName}-item`}
                            modelName={`extracted/${objectName}`}
                            transforms={transforms}
                            material={(
                                <meshStandardMaterial
                                    color={new THREE.Color(0.1, 0.1, 0.1)}
                                    depthFunc={depthFunc}
                                />
                            )}
                            fallbackGeometry={new THREE.ConeBufferGeometry(0, 0, 32)}
                            fallbackMaterial={(<meshStandardMaterial color={new THREE.Color(0.2, 0.2, 0.9)} />)}
                        />
                        <InstancedModels
                            key={`${objectName}-shadow`}
                            modelName={`extracted/${objectName}`}
                            transforms={transforms}
                            material={(
                                <shadowMaterial
                                    transparent
                                    opacity={shadowOpacity}
                                    depthFunc={depthFunc}
                                />
                            )}
                            fallbackGeometry={new THREE.ConeBufferGeometry(0, 0, 32)}
                            fallbackMaterial={(<meshStandardMaterial color={new THREE.Color(0.2, 0.2, 0.9)} />)}
                        />
                    </>
                );
            }) */}
        </>
    );
};

export default MapBlocks;
