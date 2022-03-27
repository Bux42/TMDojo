import { ReplayData } from '../api/apiRequests';
import { CameraMode } from '../contexts/SettingsContext';
import Singleton from './singleton';

class TimeLineInfos {
    tickTime: number;
    currentRaceTime: number;
    maxRaceTime: number;
    followedReplay: ReplayData | undefined;
    hoveredReplay: ReplayData | undefined;
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
