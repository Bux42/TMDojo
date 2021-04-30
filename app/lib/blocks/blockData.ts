import * as THREE from "three";

export interface Block {
    blockName: string;
    dir: number;
    baseCoord: THREE.Vector3;
    blockOffsets: THREE.Vector3[];
}

export class MapBlockData {
    offset: any = 0;
    blockNames: { [id: number]: string } = {};
    blocks: Block[] = [];

    constructor(dataView: DataView) {
        this.readDataView(dataView);
    }

    readDataView = (dataView: DataView): void => {
        while (this.offset < dataView.byteLength) {
            try {
                const blockNameLen = this.readUint8(dataView);
                let blockName = "";
                for (let i = 0; i < blockNameLen; i++) {
                    const letter = this.readUint8(dataView);
                    blockName += String.fromCharCode(letter);
                }
                const dir = this.readUint8(dataView);
                const baseCoord = this.readVector3(dataView);

                const blockOffsetAmount = this.readUint8(dataView);
                const blockOffsets = [];
                for (let i = 0; i < blockOffsetAmount; i++) {
                    const offsetX = this.readUint16(dataView);
                    const offsetY = this.readUint16(dataView);
                    const offsetZ = this.readUint16(dataView);
                    const offset = new THREE.Vector3(offsetX, offsetY, offsetZ);
                    blockOffsets.push(offset);
                }

                const block = { blockName, dir, baseCoord, blockOffsets };

                this.blocks.push(block);
            } catch (e) {
                if (!(e instanceof RangeError)) {
                    console.log("Error while reading dataview", { dataView, error: e });
                }
            }
        }
    };

    readUint16 = (dataView: DataView): number => {
        this.offset += 4;
        return dataView.getUint16(this.offset - 4, true);
    };

    readUint8 = (dataView: DataView): number => {
        this.offset += 1;
        return dataView.getUint8(this.offset - 1);
    };

    readFloat = (dataView: DataView): number => {
        this.offset += 4;
        return dataView.getFloat32(this.offset - 4, true);
    };

    readVector3 = (dataView: DataView): THREE.Vector3 => {
        const x = this.readFloat(dataView);
        const y = this.readFloat(dataView);
        const z = this.readFloat(dataView);
        return new THREE.Vector3(x, y, z);
    };
}
