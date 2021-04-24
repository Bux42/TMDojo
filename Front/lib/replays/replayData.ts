import * as THREE from "three";

export class ReplayDataPoint {
    offset: any;
    currentRaceTime: any;
    position: THREE.Vector3;
    aimYaw: any;
    aimPitch: any;
    aimDirection: THREE.Vector3;
    velocity: THREE.Vector3;
    speed: any;
    inputSteer: any;
    inputGasPedal: any;
    inputIsBraking: any;
    engineRpm: any;
    engineCurGear: any;
    wheelsContactCount: any;
    wheelsSkiddingCount: any;
    uiSequence: any;
    loaded: any = false;

    constructor(dataView: DataView, offset: number) {
        this.offset = offset;
        this.currentRaceTime = this.readInt32(dataView);
        this.position = this.readVector3(dataView);
        this.aimYaw = this.readFloat(dataView);
        this.aimPitch = this.readFloat(dataView);
        this.aimDirection = this.readVector3(dataView);
        this.velocity = this.readVector3(dataView);
        this.speed = this.readFloat(dataView);
        this.inputSteer = this.readFloat(dataView);
        const gasAndBrake = this.readInt32(dataView);
        this.inputGasPedal = gasAndBrake & 1;
        this.inputIsBraking = gasAndBrake & 2;
        this.engineRpm = this.readFloat(dataView);
        this.engineCurGear = this.readInt32(dataView);
        this.wheelsContactCount = this.readInt32(dataView);
        this.wheelsSkiddingCount = this.readInt32(dataView);
    }

    readInt32 = (dataView: DataView): number => {
        this.offset += 4;
        return dataView.getInt32(this.offset - 4, true);
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

export const readDataView = (dataView: DataView): ReplayDataPoint[] => {
    const samples = [];
    for (let i = 0; i < dataView.byteLength; i += 76) {
        const s = new ReplayDataPoint(dataView, i);
        samples.push(s);
    }
    return samples;
};
