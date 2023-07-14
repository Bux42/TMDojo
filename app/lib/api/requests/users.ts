import apiInstance from '../apiInstance';
import { AllReplaysResult } from './replays';

export type UserInfo = {
    _id: number;
    webId: string;
    playerName: string;
};
export const getUserInfo = async (webId: string): Promise<UserInfo> => {
    const { data } = await apiInstance.get(`/users/${webId}`);
    return data;
};

export const getUserReplays = async (webId: string): Promise<AllReplaysResult> => {
    const { data } = await apiInstance.get(`/users/${webId}/replays`);
    return {
        replays: data.replays,
        totalResults: data.totalResults,
    };
};
