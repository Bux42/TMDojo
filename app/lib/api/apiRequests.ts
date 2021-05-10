import axios from "axios";
import { readDataView, DataViewResult } from "../replays/replayData";

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
    file_path: string;
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
    mapName: "",
    playerName: "",
    mapUId: "",
    endRaceTimeMin: -1,
    endRaceTimeMax: -1,
    raceFinished: -1,
    dateMin: new Date(),
    maxResults: 1000,
    orderBy: "None",
};

export const getReplays = async (filters: FilterParams = DEFAULT_FILTERS): Promise<FilesResult> => {
    const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/replays", {
        params: { ...DEFAULT_FILTERS, ...filters },
        withCredentials: true,
    });

    return res.data;
};

export interface ReplayData extends FileResponse, DataViewResult {}
export const fetchReplayData = async (file: FileResponse): Promise<ReplayData> => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/replays/${file._id}`, {
        responseType: "arraybuffer",
    });

    const dataView = new DataView(res.data);
    const { samples, minPos, maxPos } = readDataView(dataView);

    return { ...file, samples, minPos, maxPos };
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
    const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + `/maps/${mapUId}/info`, {
        withCredentials: true,
    });
    return res.data;
};
