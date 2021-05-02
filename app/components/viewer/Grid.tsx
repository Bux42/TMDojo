import React from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { ReplayData } from "../../lib/api/fileRequests";
import { BLOCK_SIZE } from "../../lib/constants/block";

const GRID_COLOR = new THREE.Color(0.01, 0.01, 0.01);
const DEFAULT_GRID_SIZE = 48 * 32;
const DEFAULT_GRID_DIVISIONS = DEFAULT_GRID_SIZE / 32;
export const DEFAULT_GRID_POS = new THREE.Vector3(DEFAULT_GRID_SIZE / 2, 0, DEFAULT_GRID_SIZE / 2);

interface GridProps {
    replaysData: ReplayData[];
    blockPadding: number;
}
export const Grid = ({ replaysData, blockPadding }: GridProps): JSX.Element => {
    let minPos = new THREE.Vector3(Infinity, Infinity, Infinity);
    let maxPos = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

    // Set default grid parameters
    let gridSize = DEFAULT_GRID_SIZE;
    let gridDivisions = DEFAULT_GRID_DIVISIONS;
    let gridPos = DEFAULT_GRID_POS;

    if (replaysData.length > 0) {
        for (let i = 0; i < replaysData.length; i += 1) {
            const replay = replaysData[i];
            minPos = minPos.min(replay.minPos);
            maxPos = maxPos.max(replay.maxPos);
        }

        // Round min and max pos to block positions
        minPos = minPos.divide(BLOCK_SIZE).floor().multiply(BLOCK_SIZE);
        maxPos = maxPos.divide(BLOCK_SIZE).ceil().multiply(BLOCK_SIZE);

        // Set grid pos to middle of min and max, then round to a block pos
        gridPos = new Vector3((minPos.x + maxPos.x) / 2, minPos.y - 8, (minPos.z + maxPos.z) / 2);
        gridPos = gridPos
            .divide(BLOCK_SIZE)
            .round()
            .multiply(BLOCK_SIZE)
            .add(new Vector3(16, 0, 16));

        // Set grid size to the longest axis, round to block size, and add padding
        gridSize = Math.max(maxPos.x - minPos.x, maxPos.z - minPos.z);
        gridSize = Math.ceil(gridSize / 32) * 32;
        gridSize += blockPadding * 2 * 32;

        // Amount of grid divisions is equal to the size divided by the size of a block
        gridDivisions = gridSize / 32;
    }

    return (
        <>
            <gridHelper
                args={[gridSize, gridDivisions, GRID_COLOR, GRID_COLOR]}
                position={gridPos}
            />
        </>
    );
};
