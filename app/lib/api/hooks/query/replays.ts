import { useQuery } from 'react-query';
import queryClient from '../../reactQuery/queryClient';
import QUERY_KEYS from '../../reactQuery/queryKeys';
import API from '../../apiWrapper';

const useMapReplays = (mapUId?: string) => useQuery(
    QUERY_KEYS.mapReplays(mapUId),
    () => API.replays.fetchReplays({ mapUId }),
    {
        ...queryClient.getDefaultOptions(),
        enabled: mapUId !== undefined,
    },
);

export default useMapReplays;
