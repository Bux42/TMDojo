import { Vector3 } from 'three';
import { ReplayData } from '../api/apiRequests';
import { ReplayDataPoint } from '../replays/replayData';

interface InterpolatedValue {
    name: string;
    type: string;
}

const INTERPOLATED_VALUES: InterpolatedValue[] = [
    { name: 'position', type: 'Vector3' },
    { name: 'dir', type: 'Vector3' },
    { name: 'up', type: 'Vector3' },
    { name: 'fLDamperLen', type: 'float' },
    { name: 'fRDamperLen', type: 'float' },
    { name: 'rLDamperLen', type: 'float' },
    { name: 'rRDamperLen', type: 'float' },
    { name: 'velocity', type: 'Vector3' },
    { name: 'wheelAngle', type: 'float' },
    { name: 'speed', type: 'float' },
];

const readProp = (obj: any, prop: string) => obj[prop];

const setProp = (obj: any, prop: string, value: number) => {
    obj[prop] = value;
};

export const interpolateSamples = (
    prevSample: ReplayDataPoint,
    curSamplee: ReplayDataPoint,
    smoothSample: ReplayDataPoint,
    currentRaceTime: number,
) => {
    INTERPOLATED_VALUES.forEach((interpolatedValue) => {
        if (interpolatedValue.type === 'Vector3') {
            setInterpolatedVector(
                readProp(smoothSample, interpolatedValue.name),
                readProp(prevSample, interpolatedValue.name),
                readProp(curSamplee, interpolatedValue.name),
                readProp(prevSample, 'currentRaceTime'),
                readProp(curSamplee, 'currentRaceTime'),
                currentRaceTime,
            );
        } else {
            setProp(
                smoothSample,
                interpolatedValue.name,
                interpolateFloat(
                    readProp(prevSample, interpolatedValue.name),
                    readProp(curSamplee, interpolatedValue.name),
                    readProp(prevSample, 'currentRaceTime'),
                    readProp(curSamplee, 'currentRaceTime'),
                    currentRaceTime,
                ),
            );
        }
    });
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

let floatDiff: number;

export const interpolateFloat = (
    prevFloat: number,
    nextFloat: number,
    prevTime: number,
    nextTime: number,
    currentRaceTime: number,
): number => {
    let smoothFloat = prevFloat;
    floatDiff = nextFloat - prevFloat;

    const diffDivider = nextTime - prevTime;
    floatDiff /= diffDivider;
    smoothFloat += floatDiff * (currentRaceTime - prevTime);
    return smoothFloat;
};

const vecDiff: Vector3 = new Vector3();

export const setInterpolatedVector = (
    smoothVec: Vector3,
    prevVec: Vector3,
    nextVec: Vector3,
    prevTime: number,
    nextTime: number,
    currentRaceTime: number,
) => {
    smoothVec.set(prevVec.x, prevVec.y, prevVec.z);
    vecDiff.set(nextVec.x, nextVec.y, nextVec.z);
    vecDiff.sub(prevVec);

    const diffDivider = nextTime - prevTime;
    vecDiff.divideScalar(diffDivider);
    smoothVec.add(
        vecDiff.multiplyScalar(currentRaceTime - prevTime),
    );
};
