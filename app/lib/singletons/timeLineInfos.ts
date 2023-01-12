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
    showFullTrail: boolean;
    showTrailToStart: boolean;
    revealTrailTime: number;

    constructor() {
        this.tickTime = 1000 / 60;
        this.currentRaceTime = 0;
        this.maxRaceTime = 0;
        this.isPlaying = false;
        this.cameraMode = CameraMode.Follow;
        this.showFullTrail = true;
        this.showTrailToStart = true;
        this.revealTrailTime = 1000;
    }
}

const GlobalTimeLineInfos = Singleton(TimeLineInfos);

export default GlobalTimeLineInfos;
