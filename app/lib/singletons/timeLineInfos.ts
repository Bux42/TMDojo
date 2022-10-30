import { ReplayData } from '../api/requests/replays';
import { CameraMode } from '../contexts/SettingsContext';
import Singleton from './singleton';

class TimeLineInfos {
    tickTime: number;
    currentRaceTime: number;
    maxRaceTime: number;
    followedReplay?: ReplayData;
    hoveredReplay?: ReplayData;
    isPlaying: boolean;
    cameraMode: CameraMode;
    constructor() {
        this.tickTime = 1000 / 60;
        this.currentRaceTime = 0;
        this.maxRaceTime = 0;
        this.isPlaying = false;
        this.cameraMode = CameraMode.Follow;
    }
}

const GlobalTimeLineInfos = Singleton(TimeLineInfos);

export default GlobalTimeLineInfos;
