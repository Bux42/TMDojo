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

const posDiff: Vector3 = new Vector3();

export const setInterpolatedPosition = (
    smoothPos: Vector3,
    prevSample: ReplayDataPoint,
    curSample: ReplayDataPoint,
    currentRaceTime: number,
) => {
    smoothPos.set(prevSample.position.x, prevSample.position.y, prevSample.position.z);
    posDiff.set(curSample.position.x, curSample.position.y, curSample.position.z);
    posDiff.sub(prevSample.position);

    const diffDivider = curSample.currentRaceTime - prevSample.currentRaceTime;
    posDiff.divideScalar(diffDivider);
    smoothPos.add(
        posDiff.multiplyScalar(currentRaceTime - prevSample.currentRaceTime),
    );
};
