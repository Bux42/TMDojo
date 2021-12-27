import apiInstance from '../apiInstance';
import { readDataView, DataViewResult } from '../../replays/replayData';

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
    maxResults: 1000,
    orderBy: 'None',
};

export interface ReplayInfo {
    authorName: string;
    mapUId: string;
    date: number;
    endRaceTime: number;
    mapName: string;
    playerLogin: string;
    playerName: string;
    raceFinished: number;
    webId: string;
    _id: string;
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
        replays: data.files,
        totalResults: data.totalResults,
    };
};

export interface ReplayData extends ReplayInfo, DataViewResult {}
export const fetchReplayData = async (replay: ReplayInfo): Promise<ReplayData> => {
    const res = await apiInstance.get(`/replays/${replay._id}`, {
        responseType: 'arraybuffer',
    });

    const dataView = new DataView(res.data);
    const {
        samples, minPos, maxPos, dnfPos, color, intervalMedian,
    } = readDataView(dataView);

    return {
        ...replay,
        samples,
        minPos,
        maxPos,
        dnfPos,
        color,
        intervalMedian,
    };
};

export const deleteReplay = async (replay: ReplayInfo) => {
    await apiInstance.delete(`/replays/${replay._id}`);
};
