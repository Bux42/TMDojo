import apiInstance from './apiInstance';
import { MapBlockData } from '../blocks/blockData';
import { FileResponse } from './apiRequests';

const fetchMapBlocks = async (file: FileResponse): Promise<MapBlockData> => {
    const params = {
        mapUId: file.mapUId,
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
