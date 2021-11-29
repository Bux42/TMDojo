import * as THREE from 'three';

export interface LiveSample {
    raceTime: number,
    position: THREE.Vector3
}

const parseBuffer = (buffer: Buffer): LiveSample | undefined => {
    const pos = buffer.readInt8();

    // let index = 0;
    // for (let i = 0; index <= buffer.length - 4; i++) {
    //     let val = 0;
    //     if (index <= 1) {
    //         val = buffer.readInt32LE(index);
    //         index += 4;
    //     } else {
    //         val = buffer.readFloatLE(index);
    //         index += 4;
    //     }
    //     console.log(val);
    // }

    if (buffer.length === 16) {
        const raceTime = buffer.readInt32LE(0);
        const position = new THREE.Vector3(
            buffer.readFloatLE(4),
            buffer.readFloatLE(8),
            buffer.readFloatLE(12),
        );

        const data = {
            raceTime,
            position,
        };
        return data;
    }

    return undefined;
};

export default parseBuffer;
