import { ReplayData } from '../api/apiRequests';

export enum LoadingState {
    IDLE = 'Idle',
    DOWNLOADING = 'Downloading',
    LOADED = 'Loaded',
    ERROR = 'Error'
}

export interface FetchedReplay
{
    _id: string;
    progress: number;
    state: LoadingState;
    replay?: ReplayData;
}
