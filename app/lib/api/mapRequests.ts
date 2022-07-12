import apiInstance from './apiInstance';
import { MapBlockData, parseMapBlockData } from '../mapBlocks/blockData';

const fetchMapBlocks = async (mapUId: string): Promise<MapBlockData> => {
    const params = {
        mapUId,
    };

    const res = await apiInstance.get('/map-blocks', {
        params,
    });

    const { data } = res;

    const mapBlockData = parseMapBlockData(data);

    return mapBlockData;
};

export default fetchMapBlocks;
