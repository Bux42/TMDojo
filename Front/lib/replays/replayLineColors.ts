import { ReplayData } from "../api/fileRequests";
import * as THREE from "three";
import { ColorMap, getColorFromMap } from "../utils/colormaps";
import { ReplayDataPoint } from "./replayData";

const COLOR_MAP_SPEED: ColorMap = [
    { value: 0, color: { r: 0xff, g: 0x00, b: 0 } },
    { value: 200, color: { r: 0x00, g: 0xff, b: 0 } },
];

const COLOR_MAP_ACCELERATION: ColorMap = [
    { value: -10.0, color: { r: 0xff, g: 0x00, b: 0 } },
    { value: 0.0, color: { r: 0xff, g: 0xff, b: 0 } },
    { value: 10.0, color: { r: 0x00, g: 0xff, b: 0 } },
];

const COLOR_MAP_GEARS: ColorMap = [
    { value: 1.0, color: { r: 0xaa, g: 0x22, b: 0x66 } },
    { value: 2.0, color: { r: 0xee, g: 0x66, b: 0x77 } },
    { value: 3.0, color: { r: 0xcc, g: 0xbb, b: 0x44 } },
    { value: 4.0, color: { r: 0x66, g: 0xcc, b: 0xee } },
    { value: 5.0, color: { r: 0x22, g: 0x88, b: 0x33 } },
    { value: 6.0, color: { r: 0x66, g: 0x66, b: 0xff } },
    { value: 7.0, color: { r: 0xff, g: 0xff, b: 0xff } },
];

export const colorsToBuffer = (colors: THREE.Color[]): THREE.Float32BufferAttribute => {
    const colorBuffer = colors.map((color) => [color.r, color.g, color.b]).flat();
    return new THREE.Float32BufferAttribute(colorBuffer, 3);
};

export const defaultReplayColors = (replay: ReplayData): THREE.Color[] => {
    const color = new THREE.Color(Math.random(), Math.random(), Math.random());
    return replay.samples.map((_) => color);
};

export const speedReplayColors = (replay: ReplayData): THREE.Color[] => {
    return replay.samples.map((sample) => getColorFromMap(sample.speed, COLOR_MAP_SPEED));
};

export const accelerationReplayColors = (replay: ReplayData): THREE.Color[] => {
    const colors = [];
    let latestValidSample: ReplayDataPoint | undefined = undefined;
    let latestColor = new THREE.Color(0, 0, 0);

    for (let i = 0; i < replay.samples.length; i++) {
        const sample = replay.samples[i];

        // Skip sample if the velocity is all 0
        if (sample.velocity.x == 0 && sample.velocity.y == 0 && sample.velocity.z == 0) {
            colors.push(latestColor);
        } else {
            // If there is not last valid sample point, set to current sample
            if (latestValidSample == undefined) {
                latestValidSample = sample;
                colors.push(latestColor);
                continue;
            }

            const speedDiff = sample.speed - latestValidSample.speed;
            const timeDiff = sample.currentRaceTime - latestValidSample.currentRaceTime;
            const acc = (speedDiff / timeDiff) * 1000;
            const color = getColorFromMap(acc, COLOR_MAP_ACCELERATION);
            colors.push(color);

            latestColor = color;
            latestValidSample = sample;
        }
    }

    return colors;
};

export const gearReplayColors = (replay: ReplayData): THREE.Color[] => {
    return replay.samples.map((sample) => getColorFromMap(sample.engineCurGear, COLOR_MAP_GEARS));
};
