import { useQuery } from '@tanstack/react-query';
import queryClient from '../../queryClient';
import QUERY_KEYS from '../../queryKeys';
import API from '../../../apiWrapper';

export const useAllMaps = (searchString: string = '') => useQuery(
    QUERY_KEYS.allMaps(searchString),
    () => API.maps.getAllMaps(searchString),
);

export const useMapInfo = (mapUId?: string) => useQuery(
    QUERY_KEYS.mapInfo(mapUId),
    // default to empty string to satisfy type, this will not be fetched as query is disabled with mapUId is undefined:
    () => API.maps.getMapInfo(mapUId || ''),
    {
        ...queryClient.getDefaultOptions(),
        enabled: mapUId !== undefined,
        staleTime: 60 * 1000, // 1 minute stale time, map info should not change often
    },
);
