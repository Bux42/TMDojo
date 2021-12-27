import apiInstance from '../apiInstance';
import { FilesResult } from '../apiRequests';

export type UserInfo = {
    webId?: string;
    playerLogin?: string;
    playerName?: number;
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
