import { useQuery } from 'react-query';
import queryClient from '../../../utils/reactQuery/queryClient';
import QUERY_KEYS from '../../../utils/reactQuery/reactQueryKeys';
import api from '../../apiWrapper';

export const useAllMaps = (searchString: string = '') => useQuery(
    QUERY_KEYS.allMaps(searchString),
    () => api.maps.getAllMaps(searchString),
);

export const useMapInfo = (mapUId?: string) => useQuery(
    QUERY_KEYS.mapInfo(mapUId),
    // default to empty string to satisfy type, this will not be fetched as query is disabled with mapUId is undefined:
    () => api.maps.getMapInfo(mapUId || ''),
    {
        ...queryClient.getDefaultOptions(),
        enabled: mapUId !== undefined,
        staleTime: 60 * 1000, // 1 minute stale time, map info should not change often
    },
);
