import { ReplayData } from '../api/apiRequests';
import Singleton from './singleton';

class TimeLineInfos {
    currentRaceTime: number;
    maxRaceTime: number;
    followedReplay: ReplayData | undefined;
    hoveredReplay: ReplayData | undefined;
    isPlaying: boolean;
    constructor() {
        this.currentRaceTime = 0;
        this.maxRaceTime = 0;
        this.isPlaying = false;
    }
}

const GlobalTimeLineInfos = Singleton(TimeLineInfos);

export default GlobalTimeLineInfos;
