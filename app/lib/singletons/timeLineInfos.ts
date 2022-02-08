import { ReplayData } from '../api/apiRequests';
import Singleton from './singleton';

class TimeLineInfos {
    tickTime: number;
    currentRaceTime: number;
    maxRaceTime: number;
    followedReplay: ReplayData | undefined;
    hoveredReplay: ReplayData | undefined;
    isPlaying: boolean;
    constructor() {
        this.tickTime = 1000 / 60;
        this.currentRaceTime = 0;
        this.maxRaceTime = 0;
        this.isPlaying = false;
    }
}

const GlobalTimeLineInfos = Singleton(TimeLineInfos);

export default GlobalTimeLineInfos;
