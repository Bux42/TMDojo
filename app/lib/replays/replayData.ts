/* eslint-disable no-bitwise */
import * as THREE from 'three';

export class ReplayDataPoint {
    offset: number;
    currentRaceTime: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    speed: number;
    inputSteer: number;
    wheelAngle: number;
    inputGasPedal: number;
    inputIsBraking: number;
    engineRpm: number;
    engineCurGear: number;

    up: THREE.Vector3;
    dir: THREE.Vector3;

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

    acceleration: number;

    constructor(dataView: DataView, offset: number) {
        this.offset = offset;
        this.currentRaceTime = this.readInt32(dataView);
        this.position = this.readVector3(dataView);
        this.velocity = this.readVector3(dataView);
        this.speed = this.readFloat(dataView);
        this.inputSteer = this.readFloat(dataView);
        this.wheelAngle = this.readFloat(dataView);
        const gasAndBrake = this.readInt32(dataView);
        // gasAndBrake are encoded in a single byte using the first 2 bits
        //  00 = no input, 01 = gas, 10 = brake, 11 = gas+brake
        this.inputGasPedal = (gasAndBrake & 1);
        this.inputIsBraking = (gasAndBrake & 2);
        this.engineRpm = this.readFloat(dataView);
        this.engineCurGear = this.readInt32(dataView);
        this.up = this.readVector3(dataView);
        this.dir = this.readVector3(dataView);

        this.fLGroundContactMaterial = this.readUInt8(dataView);
        this.fLSlipCoef = this.readFloat(dataView);
        this.fLDamperLen = this.readFloat(dataView);

        this.fRGroundContactMaterial = this.readUInt8(dataView);
        this.fRSlipCoef = this.readFloat(dataView);
        this.fRDamperLen = this.readFloat(dataView);

        this.rLGroundContactMaterial = this.readUInt8(dataView);
        this.rLSlipCoef = this.readFloat(dataView);
        this.rLDamperLen = this.readFloat(dataView);

        this.rRGroundContactMaterial = this.readUInt8(dataView);
        this.rRSlipCoef = this.readFloat(dataView);
        this.rRDamperLen = this.readFloat(dataView);

        this.acceleration = 0;
    }

    readInt32 = (dataView: DataView): number => {
        this.offset += 4;
        return dataView.getInt32(this.offset - 4, true);
    };

    readUInt8 = (dataView: DataView): number => {
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

export interface DataViewResult {
    samples: ReplayDataPoint[];
    minPos: THREE.Vector3;
    maxPos: THREE.Vector3;
    dnfPos: THREE.Vector3;
    color: THREE.Color;
    intervalMedian: number;
}

export const readDataView = (dataView: DataView): DataViewResult => {
    const samples = [];
    const sampleIntervals = [];
    let intervalMedian = 20; // default to 60fps
    let lastPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    let dnfPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    let minPos = new THREE.Vector3(Infinity, Infinity, Infinity);
    let maxPos = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

    const color = new THREE.Color(Math.random(), Math.random(), Math.random());

    for (let i = 0; i < dataView.byteLength; i += 112) {
        const s = new ReplayDataPoint(dataView, i);

        if (s.position.x === 0 && s.position.y === 0 && s.position.z === 0) {
            dnfPos = lastPos;
            break;
        }
        samples.push(s);
        minPos = minPos.min(s.position);
        maxPos = maxPos.max(s.position);
        lastPos = s.position;
    }
    for (let i = 1; i < samples.length; i++) {
        const interval = samples[i].currentRaceTime - samples[i - 1].currentRaceTime;
        if (interval > 0) {
            sampleIntervals.push(interval);
        }
        samples[i].acceleration = samples[i].speed - samples[i - 1].speed;
    }
    const median = (arr: number[]) => {
        const mid = Math.floor(arr.length / 2);
        const nums = [...arr].sort((a, b) => a - b);
        return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    };
    intervalMedian = median(sampleIntervals);
    return {
        samples, minPos, maxPos, dnfPos, color, intervalMedian,
    };
};
