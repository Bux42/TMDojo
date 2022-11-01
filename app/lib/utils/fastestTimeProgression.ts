import { ReplayInfo } from '../api/requests/replays';

const calculateFastestTimeProgression = (replayList: ReplayInfo[]): ReplayInfo[] => {
    if (replayList.length === 0) {
        return [];
    }

    const fastestTimeProgressions: ReplayInfo[] = [];
    const sortedReplays = replayList.sort((a, b) => a.date - b.date);

    fastestTimeProgressions.push(sortedReplays[0]);
    for (let i = 1; i < sortedReplays.length; i++) {
        const currentReplay = sortedReplays[i];
        const latestFastestReplay = fastestTimeProgressions[fastestTimeProgressions.length - 1];
        if (currentReplay.raceFinished
            && currentReplay.endRaceTime < latestFastestReplay.endRaceTime) {
            fastestTimeProgressions.push(currentReplay);
        }
    }
    return fastestTimeProgressions;
};

export default calculateFastestTimeProgression;
