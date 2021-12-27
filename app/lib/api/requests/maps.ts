import apiInstance from '../apiInstance';

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
    const { data } = await apiInstance.get(`/maps/${mapUId}/info`);
    return data;
};

export type Map = {
    mapName: string;
    mapUId: string;
    count: number;
    lastUpdate: number;
};
export const getAllMaps = async (searchString: string): Promise<Map[]> => {
    const { data } = await apiInstance.get('/maps', {
        params: {
            mapName: searchString,
        },
    });
    return data;
};
