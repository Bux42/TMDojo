/* eslint-disable no-lonely-if */
import * as THREE from 'three';
import { ReplayData } from '../api/requests/replays';
import { ColorMap, getColorFromMap } from '../utils/colormaps';
import { ReplayDataPoint } from './replayData';

const COLOR_MAP_SPEED: ColorMap = [
    { value: 0, color: { r: 0, g: 0, b: 0.8 * 255 } },
    { value: 300, color: { r: 0, g: 0.8 * 255, b: 0 } },
    { value: 600, color: { r: 0.8 * 255, g: 0, b: 0 } },
];

const COLOR_MAP_ACCELERATION: ColorMap = [
    { value: -10.0, color: { r: 0xff, g: 0x00, b: 0 } },
    { value: 0.0, color: { r: 0xdd, g: 0xdd, b: 0 } },
    { value: 10.0, color: { r: 0x00, g: 0xff, b: 0 } },
];

export const COLOR_MAP_GEARS: ColorMap = [
    { value: 1.0, color: { r: 0xaa, g: 0x00, b: 0x00 } },
    { value: 2.0, color: { r: 0xff, g: 0x33, b: 0x22 } },
    { value: 3.0, color: { r: 0x33, g: 0xee, b: 0x44 } },
    { value: 4.0, color: { r: 0x44, g: 0x33, b: 0xee } },
    { value: 5.0, color: { r: 0x11, g: 0xaa, b: 0xaa } },
    { value: 6.0, color: { r: 0x66, g: 0x66, b: 0xff } },
    { value: 7.0, color: { r: 0xff, g: 0xff, b: 0xff } },
];

const COLOR_MAP_RPM: ColorMap = [
    { value: 10000.0, color: { r: 0xff, g: 0x00, b: 0 } },
    { value: 0.0, color: { r: 0x00, g: 0xff, b: 0 } },
];

export const colorsToBuffer = (colors: THREE.Color[]): THREE.Float32BufferAttribute => {
    const colorBuffer = [];
    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        colorBuffer.push(color.r, color.g, color.b);
    }
    return new THREE.Float32BufferAttribute(colorBuffer, 3);
};

export const defaultReplayColors = (replay: ReplayData): THREE.Float32BufferAttribute => {
    const colorBuffer = [];
    const { color } = replay;
    for (let i = 0; i < replay.samples.length; i++) {
        colorBuffer.push(color.r, color.g, color.b);
    }
    return new THREE.Float32BufferAttribute(colorBuffer, 3);
};

export const speedReplayColors = (replay: ReplayData): THREE.Float32BufferAttribute => {
    const colorBuffer = [];
    for (let i = 0; i < replay.samples.length; i++) {
        const sample = replay.samples[i];
        const color = getColorFromMap(sample.speed, COLOR_MAP_SPEED);
        colorBuffer.push(color.r, color.g, color.b);
    }
    return new THREE.Float32BufferAttribute(colorBuffer, 3);
};

export const rpmReplayColors = (replay: ReplayData): THREE.Float32BufferAttribute => {
    const colorBuffer = [];
    for (let i = 0; i < replay.samples.length; i++) {
        const sample = replay.samples[i];
        const color = getColorFromMap(sample.engineRpm, COLOR_MAP_RPM);
        colorBuffer.push(color.r, color.g, color.b);
    }
    return new THREE.Float32BufferAttribute(colorBuffer, 3);
};

export const accelerationReplayColors = (replay: ReplayData): THREE.Float32BufferAttribute => {
    const colorBuffer = [];
    let latestValidSample: ReplayDataPoint | undefined;
    let latestColor = new THREE.Color(0, 0, 0);

    for (let i = 0; i < replay.samples.length; i++) {
        const sample = replay.samples[i];

        // Skip sample if the velocity is all 0
        if (sample.velocity.x === 0 && sample.velocity.y === 0 && sample.velocity.z === 0) {
            colorBuffer.push(latestColor.r, latestColor.g, latestColor.b);
        } else {
            // If there is not last valid sample point, set to current sample
            if (latestValidSample === undefined) {
                latestValidSample = sample;
                colorBuffer.push(latestColor.r, latestColor.g, latestColor.b);
            } else if (latestValidSample.speed === sample.speed) {
                colorBuffer.push(latestColor.r, latestColor.g, latestColor.b);
            } else {
                const speedDiff = sample.speed - latestValidSample.speed;
                const timeDiff = sample.currentRaceTime - latestValidSample.currentRaceTime;
                const acc = (speedDiff / timeDiff) * 1000;
                const color = getColorFromMap(acc, COLOR_MAP_ACCELERATION);
                colorBuffer.push(color.r, color.g, color.b);

                latestColor = color;
                latestValidSample = sample;
            }
        }
    }

    return new THREE.Float32BufferAttribute(colorBuffer, 3);
};

export const gearReplayColors = (replay: ReplayData): THREE.Float32BufferAttribute => {
    const colorBuffer = [];
    for (let i = 0; i < replay.samples.length; i++) {
        const sample = replay.samples[i];
        const color = getColorFromMap(sample.engineCurGear, COLOR_MAP_GEARS);
        colorBuffer.push(color.r, color.g, color.b);
    }
    return new THREE.Float32BufferAttribute(colorBuffer, 3);
};

export const inputReplayColors = (replay: ReplayData): THREE.Float32BufferAttribute => {
    const colorBuffer = [];
    for (let i = 0; i < replay.samples.length; i++) {
        const sample = replay.samples[i];
        const input = 0;
        const color = new THREE.Color(1, 1, 1);
        if (sample.inputGasPedal) {
            color.r = 0;
            color.g = 1;
            color.b = 0;
        }
        if (sample.inputIsBraking) {
            color.r = 1;
            color.g = 0;
            color.b = 0;
        }
        if (sample.inputIsBraking && sample.inputGasPedal) {
            color.r = 1;
            color.g = 1;
            color.b = 0;
        }
        colorBuffer.push(color.r, color.g, color.b);
    }
    return new THREE.Float32BufferAttribute(colorBuffer, 3);
};

export const addAlphaChannel = (rgbBuffer: THREE.Float32BufferAttribute, alpha: number = 1) => {
    const alphaList = [];
    for (let i = 0; i < rgbBuffer.count; i++) {
        alphaList.push(rgbBuffer.getX(i), rgbBuffer.getY(i), rgbBuffer.getZ(i), alpha);
    }
    const alphaBuffer = new THREE.Float32BufferAttribute(alphaList, 4);
    return alphaBuffer;
};
