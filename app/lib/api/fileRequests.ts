import axios from "axios";
import { readDataView, ReplayDataPoint, DataViewResult } from "../replays/replayData";

interface FilterParams {
    mapName: any;
    playerName: string;
    endRaceTimeMin: number;
    endRaceTimeMax: number;
    raceFinished: number;
    dateMin: any;
    maxResults: number;
    orderBy: any;
}

export interface FileResponse {
    authorName: string;
    challengeId: string;
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
    Files: FileResponse[];
    TotalResults: number;
};

const DEFAULT_FILTERS = {
    mapName: "",
    playerName: "",
    endRaceTimeMin: -1,
    endRaceTimeMax: -1,
    raceFinished: -1,
    dateMin: new Date(),
    maxResults: 1000,
    orderBy: "None",
};

export const getFiles = async (filters: FilterParams = DEFAULT_FILTERS): Promise<FilesResult> => {
    const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/get-files", {
        params: filters,
        withCredentials: true,
    });

    return res.data;
};

export interface ReplayData extends FileResponse, DataViewResult {}
export const fetchReplayData = async (file: FileResponse): Promise<ReplayData> => {
    const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/get-race-data", {
        params: { filePath: file.file_path },
        responseType: "arraybuffer",
    });

    const dataView = new DataView(res.data);
    const { samples, minPos, maxPos } = readDataView(dataView);

    return { ...file, samples, minPos, maxPos };
};
