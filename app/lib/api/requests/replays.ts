import apiInstance from '../apiInstance';
import { readDataView, DataViewResult } from '../../replays/replayData';
import { DownloadState, ReplayDownloadState } from '../../replays/replayDownloadState';

interface FilterParams {
    mapName?: string;
    playerName?: string;
    mapUId?: string;
    endRaceTimeMin?: number;
    endRaceTimeMax?: number;
    raceFinished?: number;
    dateMin?: Date;
    maxResults?: number;
    orderBy?: string;
}
const DEFAULT_FILTERS = {
    mapName: '',
    playerName: '',
    mapUId: '',
    endRaceTimeMin: -1,
    endRaceTimeMax: -1,
    raceFinished: -1,
    dateMin: new Date(),
    maxResults: 10000,
    orderBy: 'None',
};

// TODO: Remove old replay info interface
// export interface ReplayInfo {
//     sectorTimes?: number[];
//     authorName: string;
//     mapUId: string;
//     date: number;
//     endRaceTime: number;
//     mapName: string;
//     playerLogin: string;
//     playerName: string;
//     raceFinished: number;
//     webId: string;
//     _id: string;
// }

export interface ReplayInfo {
    _id: string;
    date: number;
    endRaceTime: number;
    raceFinished: number;
    sectorTimes?: number[];
    pluginVersion: string;
    userRef: string;
    user: {
        _id: string;
        webId: string;
        playerName: string;
    }
    mapRef: string;
    map: {
        _id: string;
        authorName: string;
        fileUrl: string;
        mapName: string;
        mapUId: string;
        medals: {
            author: number;
            bronze: number;
            silver: number;
            gold: number;
        };
        thumbnailUrl: string;
    }
}

export type AllReplaysResult = {
    replays: ReplayInfo[];
    totalResults: number;
};

export const fetchReplays = async (filters: FilterParams = DEFAULT_FILTERS): Promise<AllReplaysResult> => {
    const { data } = await apiInstance.get('/replays', {
        params: { ...DEFAULT_FILTERS, ...filters },
    });

    return {
        replays: data.replays,
        totalResults: data.totalResults,
    };
};

export interface ReplayData extends ReplayInfo, DataViewResult { }
export const fetchReplayData = async (
    replay: ReplayInfo,
    downloadProgress?: (replay: ReplayInfo, progressEvent: ProgressEvent) => void,
): Promise<ReplayDownloadState> => {
    const fetchedReplay: ReplayDownloadState = {
        _id: replay._id,
        state: DownloadState.DOWNLOADING,
        progress: 0,
    };

    const res = await apiInstance.get(`/replays/${replay._id}/file`, {
        onDownloadProgress: (e) => {
            if (downloadProgress) {
                downloadProgress(replay, e);
            }
        },
        responseType: 'arraybuffer',
    });

    const dataView = new DataView(res.data);
    const {
        samples, minPos, maxPos, dnfPos, color, intervalMedian,
    } = await readDataView(dataView);

    fetchedReplay.replay = {
        ...replay, samples, minPos, maxPos, dnfPos, color, intervalMedian,
    };
    fetchedReplay.progress = 1;
    fetchedReplay.state = DownloadState.LOADED;

    return fetchedReplay;
};

export const deleteReplay = async (replay: ReplayInfo) => {
    await apiInstance.delete(`/replays/${replay._id}`);
};
