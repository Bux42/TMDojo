import apiInstance from './apiInstance';
import { readDataView, DataViewResult } from '../replays/replayData';
import { FetchedReplay, LoadingState } from '../replays/fetchedReplay';

interface FilterParams {
    mapName?: any;
    playerName?: string;
    mapUId?: string;
    endRaceTimeMin?: number;
    endRaceTimeMax?: number;
    raceFinished?: number;
    dateMin?: any;
    maxResults?: number;
    orderBy?: any;
}

export interface FileResponse {
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

type FilesResult = {
    files: FileResponse[];
    totalResults: number;
};

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

export const getReplays = async (filters: FilterParams = DEFAULT_FILTERS): Promise<FilesResult> => {
    const res = await apiInstance.get('/replays', {
        params: { ...DEFAULT_FILTERS, ...filters },
    });
    return res.data;
};

export interface ReplayData extends FileResponse, DataViewResult {}
export const fetchReplayData = async (
    file: FileResponse,
    downloadProgress: (progressEvent: any) => void,
): Promise<FetchedReplay> => {
    const fetchedReplay: FetchedReplay = {
        _id: file._id,
        state: LoadingState.LOADED,
        progress: 0,
    };

    try {
        const res = await apiInstance.get(`/replays/${(Math.random() < 0.7 ? file._id : 'xD')}`, {
            onDownloadProgress: downloadProgress,
            responseType: 'arraybuffer',
        });

        const dataView = new DataView(res.data);
        const {
            samples, minPos, maxPos, dnfPos, color, intervalMedian,
        } = await readDataView(dataView);

        fetchedReplay.replay = {
            ...file, samples, minPos, maxPos, dnfPos, color, intervalMedian,
        };
    } catch {
        fetchedReplay.progress = 0;
        fetchedReplay.state = LoadingState.ERROR;
    }
    return fetchedReplay;
};

export type MapInfo = {
    mapUid?: string;
    name?: string;
    authorScore?: number;
    goldScore?: number;
    silverScore?: number;
    bronzeScore?: number;
    authordisplayname?: string;
    exchangeid?: number;
};

export const getMapInfo = async (mapUId: string): Promise<MapInfo> => {
    const res = await apiInstance.get(`/maps/${mapUId}/info`);
    return res.data;
};

export type AvailableMap = {
    mapName: string;
    mapUId: string;
    count: number;
    lastUpdate: number;
};

export const getAvailableMaps = async (searchString: string): Promise<AvailableMap[]> => {
    const res = await apiInstance.get('/maps', {
        params: {
            mapName: searchString,
        },
    });
    return res.data;
};

export const deleteReplay = async (replay: FileResponse) => {
    await apiInstance.delete(`/replays/${replay._id}`);
};

export type UserInfo = {
    webId?: string;
    playerLogin?: string;
    playerName?: string;
    _id?: number;
};

export const getUserInfo = async (webId: string): Promise<UserInfo> => {
    const res = await apiInstance.get(`/users/${webId}/info`);
    return res.data;
};

export const getUserReplays = async (webId: string): Promise<FilesResult> => {
    const res = await apiInstance.get(`/users/${webId}/replays`);
    return res.data;
};
