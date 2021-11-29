// type Vector3 = [
//     x: number,
//     y: number,
//     z: number,
// ]

interface LiveSample {
    raceTime: number;
    position: number[]
}

const parseBuffer = (buffer: Buffer): LiveSample | undefined => {
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
        const position = [buffer.readFloatLE(4), buffer.readFloatLE(8), buffer.readFloatLE(12)];
        const data = {
            raceTime, position,
        };
        return data;
    }

    return undefined;
};

export default parseBuffer;
