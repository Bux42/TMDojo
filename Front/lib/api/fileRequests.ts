import axios from "axios";

interface FilterParams {
    mapName: string;
    playerName: string;
    endRaceTimeMin: number;
    endRaceTimeMax: number;
    raceFinished: boolean;
    dateMin: any;
    maxResults: number;
    orderBy: any;
}

// TODO: add actual type for files
type FilesResult = any[];

export const getFiles = async (filters: FilterParams): Promise<FilesResult> => {
    console.log(filters);

    // TODO: Add correct URL for prod (use a .env file)
    const res = await axios.get("http://localhost:3000/get-files", {
        ...filters,
        withCredentials: true,
    });

    return res.data;
};
