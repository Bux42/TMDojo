import axios from 'axios';
import apiInstance from './apiInstance';
import { MapBlockData, parseMapBlockData } from '../mapBlocks/mapBlockData';

const cloudFrontUrl = process.env.NEXT_PUBLIC_MAP_MESHES_CLOUDFRONT_URL;
const mapBlocksPathUrl = cloudFrontUrl
    ? `${cloudFrontUrl}/map-blocks`
    : undefined;

const fetchMapBlocksRemote = async (mapUId: string): Promise<MapBlockData> => {
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

const fetchMapBlocks = async (mapUId: string): Promise<MapBlockData | undefined> => {
    if (!mapBlocksPathUrl) {
        console.log('MapBlocksPathUrl is not set, trying to fetch remotely instead');
        return fetchMapBlocksRemote(mapUId);
    }

    const res = await axios.get(
        `${mapBlocksPathUrl}/${mapUId}.json`,
        { withCredentials: false },
    );

    const { data } = res;

    const mapBlockData = parseMapBlockData(data);

    return mapBlockData;
};

export default fetchMapBlocks;
