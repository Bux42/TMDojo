import apiInstance from '../apiInstance';
import { AllReplaysResult } from './replays';

export type UserInfo = {
    webId?: string;
    playerLogin?: string;
    playerName?: string;
    _id?: string;
    createdAt?: number;
    privateReplays?: boolean;
};
export const getUserInfo = async (webId: string): Promise<UserInfo> => {
    const { data } = await apiInstance.get(`/users/${webId}/info`);
    return data;
};

export const getUserReplays = async (
    webId: string,
): Promise<AllReplaysResult> => {
    const { data } = await apiInstance.get(`/users/${webId}/replays`);
    return {
        replays: data.files,
        totalResults: data.totalResults,
    };
};

export const setPrivateReplays = async (webId: string, privateReplays: boolean): Promise<void> => {
    await apiInstance.put(`/users/${webId}/private-replays`, {
        privateReplays,
    });
};
