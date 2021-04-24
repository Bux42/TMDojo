import React from "react";
import * as THREE from "three";

const GRID_COLOR = new THREE.Color(0.7, 0.7, 0.7);
const GRID_SIZE = 48 * 32;
const GRID_DIVISIONS = 32;
export const GRID_POS = new THREE.Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2);

export const Grid = (): JSX.Element => {
    return (
        <gridHelper
            args={[GRID_SIZE, GRID_DIVISIONS, GRID_COLOR, GRID_COLOR]}
            position={GRID_POS}
        />
    );
};
