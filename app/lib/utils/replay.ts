import { ReplayData } from '../api/apiRequests';
import { ReplayDataPoint } from '../replays/replayData';

export const getClosestSampleIndexBeforeTime = (replay: ReplayData, raceTime: number): number => {
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
        && replay.samples[sampleIndex + 1].currentRaceTime < raceTime) {
        sampleIndex++;
    }

    return sampleIndex;
};

export const getClosestSampleBeforeTime = (replay: ReplayData, raceTime: number): ReplayDataPoint => {
    const sampleIndex = getClosestSampleIndexBeforeTime(replay, raceTime);

    return replay.samples[sampleIndex];
};
