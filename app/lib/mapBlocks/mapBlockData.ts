import { Anchor } from 'antd';
import { Vector3 } from 'three';

export interface Block {
    name: string;
    pos: Vector3;
    dir: number;
    blockOffsets: Vector3[];
}
export interface AnchoredObject {
    name: string;
    pos: Vector3;
    pitch: number;
    yaw: number;
    roll: number;
}
export interface MapBlockData {
    nadeoBlocks: Block[],
    anchoredObjects: AnchoredObject[]
}

export const parseMapBlockData = (json: any): MapBlockData => {
    const mapBlockData: MapBlockData = {
        nadeoBlocks: json.nadeoBlocks.map((block: any) => ({
            name: block.name,
            pos: new Vector3(block.pos[0], block.pos[1], block.pos[2]),
            dir: block.dir,
            blockOffsets: block.blockOffsets.map((offset: any) => new Vector3(offset[0], offset[1], offset[2])),
        })),
        anchoredObjects: json.anchoredObjects.map((anchoredObject: any) => ({
            name: anchoredObject.name,
            pos: new Vector3(anchoredObject.pos[0], anchoredObject.pos[1], anchoredObject.pos[2]),
            pitch: anchoredObject.pitch,
            yaw: anchoredObject.yaw,
            roll: anchoredObject.roll,
        })),
    };

    return mapBlockData;
};
