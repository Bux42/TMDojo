interface LiveSample {
    raceTime: number;
    position: number[]
}

const parseBuffer = (buffer: Buffer): LiveSample | undefined => {
    // Check if buffer matches the desired length
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
