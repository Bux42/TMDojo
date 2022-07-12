import { Vector3 } from 'three';
import { BLOCK_SIZE } from '../constants/block';
import { Block } from './blockData';

const calcBlockCoord = (block: Block) => {
    const { baseCoord, blockOffsets, dir } = block;

    const meshCoord = new Vector3(baseCoord.x, baseCoord.y - 8, baseCoord.z);

    const modelCoord = new Vector3().add(meshCoord).add(new Vector3(
        -BLOCK_SIZE.x / 2,
        BLOCK_SIZE.y / 2,
        -BLOCK_SIZE.z / 2,
    ));

    const maxX = Math.max(...blockOffsets.map((offset) => offset.x)) * BLOCK_SIZE.x + BLOCK_SIZE.x;
    const maxZ = Math.max(...blockOffsets.map((offset) => offset.z)) * BLOCK_SIZE.z + BLOCK_SIZE.z;

    const positionWithOffset = new Vector3().add(modelCoord).add(new Vector3(
        (dir === 1 || dir === 2) ? maxX : 0,
        0,
        (dir === 2 || dir === 3) ? maxZ : 0,
    ));

    return positionWithOffset;
};

export default calcBlockCoord;
