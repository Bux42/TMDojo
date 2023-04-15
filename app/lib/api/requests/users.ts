import apiInstance from '../apiInstance';
import { AllReplaysResult } from './replays';

export type UserInfo = {
    webId?: string;
    playerLogin?: string;
    playerName?: string;
    _id?: number;
};
export const getUserInfo = async (webId: string): Promise<UserInfo> => {
    const { data } = await apiInstance.get(`/users/${webId}/info`);
    return data;
};

export const getUserReplays = async (webId: string): Promise<AllReplaysResult> => {
    const { data } = await apiInstance.get(`/users/${webId}/replays`);
    return {
        replays: data.files,
        totalResults: data.totalResults,
    };
};
