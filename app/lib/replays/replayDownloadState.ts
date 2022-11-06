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
