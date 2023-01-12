import { useQuery } from '@tanstack/react-query';
import queryClient from '../../queryClient';
import QUERY_KEYS from '../../queryKeys';
import API from '../../../apiWrapper';

export const useMapReplays = (mapUId?: string) => useQuery(
    QUERY_KEYS.mapReplays(mapUId),
    () => API.replays.fetchReplays({ mapUId }),
    {
        ...queryClient.getDefaultOptions(),
        enabled: mapUId !== undefined,
    },
);

export const useUserReplays = (webId?: string) => useQuery(
    QUERY_KEYS.userReplays(webId),
    () => API.users.getUserReplays(webId || ''),
    {
        ...queryClient.getDefaultOptions(),
        enabled: webId !== undefined,
    },
);
