import { ReplayData } from '../api/requests/replays';
import Singleton from './singleton';

class TimeLineInfos {
    currentRaceTime: number;
    maxRaceTime: number;
    followedReplay?: ReplayData;
    hoveredReplay?: ReplayData;
    isPlaying: boolean;
    constructor() {
        this.currentRaceTime = 0;
        this.maxRaceTime = 0;
        this.isPlaying = false;
    }
}

const GlobalTimeLineInfos = Singleton(TimeLineInfos);

export default GlobalTimeLineInfos;
