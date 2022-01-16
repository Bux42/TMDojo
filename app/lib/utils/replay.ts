import { Vector3 } from 'three';
import { ReplayData } from '../api/apiRequests';
import { ReplayDataPoint } from '../replays/replayData';

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
