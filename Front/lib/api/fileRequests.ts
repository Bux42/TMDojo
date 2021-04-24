import axios from "axios";

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

export type FileResponse = {
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
};

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
    // TODO: Add correct URL for prod (use a .env file)
    const res = await axios.get("http://localhost:3000/get-files", {
        params: filters,
        withCredentials: true,
    });

    return res.data;
};
