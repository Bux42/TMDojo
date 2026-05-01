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

export type MapWithStats = {
    mapName: string;
    mapUId: string;
    count: number;
    lastUpdate: number;
};

export type MapSortBy = 'map_name' | 'last_updated' | 'replay_count';
export type MapSortOrder = 'desc' | 'asc';

export const getAllMaps = async (
    searchString: string,
    offset: number = 0,
    limit: number = 50,
    sortBy: MapSortBy = 'last_updated',
    sortOrder: MapSortOrder = 'desc',
): Promise<MapWithStats[]> => {
    const { data } = await apiInstance.get('/maps', {
        params: {
            mapName: searchString || undefined,
            offset,
            limit,
            sortBy,
            sortOrder,
        },
    });
    return data.maps;
};

export const getMapCount = async (searchString?: string): Promise<number> => {
    const { data } = await apiInstance.get('/maps/count', {
        params: {
            mapName: searchString || undefined,
        },
    });
    return data.total;
};

export const getReplayCount = async (): Promise<number> => {
    const { data } = await apiInstance.get('/maps/replays/count');
    return data.total;
};
