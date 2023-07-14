import apiInstance from '../apiInstance';

export type MapInfo = {
    _id: string;
    mapName: string;
    mapUId: string;
    exchangeId: number;
    authorName: string;
    authorId: string;
    fileUrl: string;
    thumbnailUrl: string;
    timestamp: string;
    medals: {
        bronze: number;
        silver: number;
        gold: number;
        author: number;
    };
};
export const getMapInfo = async (mapUId: string): Promise<MapInfo> => {
    const { data } = await apiInstance.get(`/maps/${mapUId}`);
    return data;
};

export type MapWithStats = {
    mapName: string;
    mapUId: string;
    count: number;
    lastUpdate: number;
};
export const getAllMaps = async (searchString: string): Promise<MapWithStats[]> => {
    const { data } = await apiInstance.get('/maps', {
        params: {
            mapName: searchString,
        },
    });
    return data;
};
