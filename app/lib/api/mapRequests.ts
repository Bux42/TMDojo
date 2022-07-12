import apiInstance from './apiInstance';
import { MapBlockData } from '../mapBlocks/blockData';

const fetchMapBlocks = async (mapUId: string): Promise<MapBlockData> => {
    const params = {
        mapUId,
    };

    const res = await apiInstance.get('/map-blocks', {
        params,
        responseType: 'arraybuffer',
    });

    const { data } = res;
    const dataView = new DataView(data);
    const blockManager = new MapBlockData(dataView);

    return blockManager;
};

export default fetchMapBlocks;
