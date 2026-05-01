import { useQuery } from '@tanstack/react-query';
import queryClient from '../../queryClient';
import QUERY_KEYS from '../../queryKeys';
import API from '../../../apiWrapper';
import { MapSortBy, MapSortOrder } from '../../../requests/maps';
import { TIME_IN_MS } from '../../../../utils/time';

export const useAllMaps = (
    searchString: string = '',
    offset: number = 0,
    limit: number = 50,
    sortBy: MapSortBy = 'last_updated',
    sortOrder: MapSortOrder = 'desc',
) =>
    useQuery(
        QUERY_KEYS.allMaps(searchString, offset, limit, sortBy, sortOrder),
        () => API.maps.getAllMaps(searchString, offset, limit, sortBy, sortOrder),
    );

export const useMapCount = (searchString: string = '') =>
    useQuery(
        QUERY_KEYS.mapCount(searchString),
        () => API.maps.getMapCount(searchString),
    );

export const useReplayCount = () =>
    useQuery(
        QUERY_KEYS.replayCount(),
        () => API.maps.getReplayCount(),
    );

export const useMapInfo = (mapUId?: string) =>
    useQuery(
        QUERY_KEYS.mapInfo(mapUId),
        // eslint-disable-next-line max-len
        // default to empty string to satisfy type, this will not be fetched as query is disabled with mapUId is undefined:
        () => API.maps.getMapInfo(mapUId || ''),
        {
            ...queryClient.getDefaultOptions(),
            enabled: mapUId !== undefined,
            staleTime: TIME_IN_MS.HOUR, // Long stale time, map info should not change often
        },
    );
