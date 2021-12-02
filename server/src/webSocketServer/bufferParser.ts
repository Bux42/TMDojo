/* eslint-disable no-bitwise */
type Vector3 = [number, number, number];

interface LiveSample {
    currentRaceTime: number;
    position: Vector3;
    velocity: Vector3;
    speed: number;
    inputSteer: number;
    wheelAngle: number;
    inputGasPedal: number;
    inputIsBraking: number;
    engineRpm: number;
    engineCurGear: number;

    up: Vector3;
    dir: Vector3;

    fLGroundContactMaterial: number;
    fLSlipCoef: number;
    fLDamperLen: number;

    fRGroundContactMaterial: number;
    fRSlipCoef: number;
    fRDamperLen: number;

    rLGroundContactMaterial: number;
    rLSlipCoef: number;
    rLDamperLen: number;

    rRGroundContactMaterial: number;
    rRSlipCoef: number;
    rRDamperLen: number;

}

const parseBuffer = (buffer: Buffer): LiveSample | undefined => {
    let index = 0;

    const readInt32 = (): number => {
        const val = buffer.readInt32LE(index);
        index += 4;
        return val;
    };

    const readFloat = (): number => {
        const val = buffer.readFloatLE(index);
        index += 4;
        return val;
    };

    const readVector3 = (): Vector3 => [readFloat(), readFloat(), readFloat()];

    const readUInt8 = (): number => {
        const val = buffer.readUInt8(index);
        index += 1;
        return val;
    };

    // Check if buffer matches the desired length
    console.log(buffer.length);

    if (buffer.length === 112) {
        const currentRaceTime = readInt32();
        const position = readVector3();
        const velocity = readVector3();
        const speed = readFloat();
        const inputSteer = readFloat();
        const wheelAngle = readFloat();
        const gasAndBrake = readInt32();
        // gasAndBrake are encoded in a single byte using the first 2 bits
        //  00 = no input, 01 = gas, 10 = brake, 11 = gas+brake
        const inputGasPedal = (gasAndBrake & 1) ? 1 : 0;
        const inputIsBraking = (gasAndBrake & 2) ? 1 : 0;
        const engineRpm = readFloat();
        const engineCurGear = readFloat();

        const up = readVector3();
        const dir = readVector3();

        const fLGroundContactMaterial = readUInt8();
        const fLSlipCoef = readFloat();
        const fLDamperLen = readFloat();

        const fRGroundContactMaterial = readUInt8();
        const fRSlipCoef = readFloat();
        const fRDamperLen = readFloat();

        const rLGroundContactMaterial = readUInt8();
        const rLSlipCoef = readFloat();
        const rLDamperLen = readFloat();

        const rRGroundContactMaterial = readUInt8();
        const rRSlipCoef = readFloat();
        const rRDamperLen = readFloat();

        return {
            currentRaceTime,
            position,
            velocity,
            speed,
            inputSteer,
            wheelAngle,
            inputGasPedal,
            inputIsBraking,
            engineRpm,
            engineCurGear,
            up,
            dir,
            fLGroundContactMaterial,
            fLSlipCoef,
            fLDamperLen,
            fRGroundContactMaterial,
            fRSlipCoef,
            fRDamperLen,
            rLGroundContactMaterial,
            rLSlipCoef,
            rLDamperLen,
            rRGroundContactMaterial,
            rRSlipCoef,
            rRDamperLen,
        };
    }

    return undefined;
};

export default parseBuffer;
