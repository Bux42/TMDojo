import { Vector3 } from 'three';
import { ReplayData } from '../api/apiRequests';
import { ReplayDataPoint } from '../replays/replayData';

export const interpolateSamples = (
    prev: ReplayDataPoint,
    current: ReplayDataPoint,
    smooth: ReplayDataPoint,
    currentRaceTime: number,
) => {
    const factor: number = (currentRaceTime - prev.currentRaceTime) / (current.currentRaceTime - prev.currentRaceTime);

    setInterpolatedVector(smooth.position, prev.position, current.position, factor);
    setInterpolatedVector(smooth.dir, prev.dir, current.dir, factor);
    setInterpolatedVector(smooth.up, prev.up, current.up, factor);
    setInterpolatedVector(smooth.velocity, prev.velocity, current.velocity, factor);

    smooth.fLDamperLen = interpolateFloat(prev.fLDamperLen, current.fLDamperLen, factor);
    smooth.fRDamperLen = interpolateFloat(prev.fRDamperLen, current.fRDamperLen, factor);
    smooth.rLDamperLen = interpolateFloat(prev.rLDamperLen, current.rLDamperLen, factor);
    smooth.rRDamperLen = interpolateFloat(prev.rRDamperLen, current.rRDamperLen, factor);

    smooth.wheelAngle = interpolateFloat(prev.wheelAngle, current.wheelAngle, factor);
    smooth.speed = interpolateFloat(prev.speed, current.speed, factor);
};

export const getSampleNearTime = (replay: ReplayData, raceTime: number): ReplayDataPoint => {
    // First sample index guess based on median data point interval
    let sampleIndex = Math.round(raceTime / replay.intervalMedian);
    sampleIndex = Math.min(Math.max(0, sampleIndex), replay.samples.length - 1);

    // If we are past the race time, iterate backward in time
    while (sampleIndex > 0
        && replay.samples[sampleIndex].currentRaceTime > raceTime) {
        sampleIndex--;
    }
    // If we are before the race time, iterate forward in time
    while (sampleIndex + 1 < replay.samples.length
        && replay.samples[sampleIndex].currentRaceTime < raceTime) {
        sampleIndex++;
    }

    return replay.samples[sampleIndex];
};

export const interpolateFloat = (
    prevFloat: number,
    currentFloat: number,
    factor: number,
): number => prevFloat + factor * (currentFloat - prevFloat);

export const setInterpolatedVector = (
    smoothVec: Vector3,
    prevVec: Vector3,
    currentVec: Vector3,
    factor: number,
) => {
    smoothVec.set(
        interpolateFloat(prevVec.x, currentVec.x, factor),
        interpolateFloat(prevVec.y, currentVec.y, factor),
        interpolateFloat(prevVec.z, currentVec.z, factor),
    );
};
