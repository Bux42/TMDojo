import React from "react";
import * as THREE from "three";
import { MapBlockData } from "../../lib/blocks/blockData";
import { BasicBlock, BASE_BLOCK_COLOR, BASE_BLOCK_OPACITY } from "./blocks/basicBlock";
import { CpBlock, FinishBlock, StartBlock } from "./blocks/landmarkBlocks";

interface Props {
    mapBlockData: MapBlockData;
}

interface MapBlockProps {
    meshCoord: THREE.Vector3;
    blockName: string;
    dir: number;
    colorOverride?: THREE.Color;
}

const MapBlock = ({ meshCoord, blockName, colorOverride, dir }: MapBlockProps) => {
    if (blockName.includes("TechStart")) {
        return <StartBlock meshCoord={meshCoord} />;
    }

    if (blockName.includes("TechFinish")) {
        return <FinishBlock meshCoord={meshCoord} />;
    }

    if (blockName.includes("Checkpoint")) {
        return <CpBlock meshCoord={meshCoord} blockName={blockName} dir={dir} />;
    }

    return (
        <BasicBlock
            meshCoord={meshCoord}
            color={colorOverride || BASE_BLOCK_COLOR}
            opacity={BASE_BLOCK_OPACITY}
        />
    );
};

export const MapBlocks = ({ mapBlockData }: Props): JSX.Element => {
    const filteredBlocks = mapBlockData.blocks.filter((block) => {
        const { blockName, baseCoord } = block;

        if (baseCoord.y == 12 && blockName.includes("Grass")) {
            return false;
        }

        const blockBlacklist = [
            "Pillar",
            "Deco",
            "Stage",
            "Light",
            "Technics",
            "Structure",
            "PlatformGrassWallOutCurve",
            "TrackWallCurve",
        ];

        const isBlacklisted = blockBlacklist.some((blacklistedBlock) =>
            blockName.includes(blacklistedBlock)
        );

        return !isBlacklisted;
    });

    return (
        <>
            {filteredBlocks.map((block) => {
                // Render all offset blocks from the filtered blocks
                return (
                    <>
                        {block.blockOffsets.map((offset, i) => {
                            // Skip additional offset blocks for start, finish, and checkpoints
                            if (i > 0) {
                                if (
                                    block.blockName.includes("Start") ||
                                    block.blockName.includes("Finish") ||
                                    block.blockName.includes("Checkpoint")
                                ) {
                                    return;
                                }
                            }

                            const offsetCoord = new THREE.Vector3().addVectors(
                                block.baseCoord,
                                new THREE.Vector3(offset.x * 32, offset.y * 8 - 8, offset.z * 32)
                            );

                            return (
                                <MapBlock
                                    key={i}
                                    meshCoord={offsetCoord}
                                    blockName={block.blockName}
                                    dir={block.dir}
                                />
                            );
                        })}
                    </>
                );
            })}
        </>
    );
};
