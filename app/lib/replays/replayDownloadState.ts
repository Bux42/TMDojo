import { ReplayData } from '../api/apiRequests';

export enum DownloadState {
    DOWNLOADING = 'Downloading',
    LOADED = 'Loaded',
    ERROR = 'Error'
}

export interface ReplayDownloadState
{
    _id: string;
    progress: number;
    state: DownloadState;
    replay?: ReplayData;
}

export const createNewReplayDownloadState = (id: string) => ({
    _id: id,
    progress: 0,
    state: DownloadState.DOWNLOADING,
});

export const createErrorReplayDownloadState = (id: string) => ({
    _id: id,
    progress: 0,
    state: DownloadState.ERROR,
});
