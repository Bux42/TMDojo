import { useQuery } from 'react-query';
import queryClient from '../../../utils/reactQuery/queryClient';
import QUERY_KEYS from '../../../utils/reactQuery/reactQueryKeys';
import api from '../../apiWrapper';

const useMapReplays = (mapUId?: string) => useQuery(
    QUERY_KEYS.mapReplays(mapUId),
    () => api.replays.fetchReplays({ mapUId }),
    {
        ...queryClient.getDefaultOptions(),
        enabled: mapUId !== undefined,
    },
);

export default useMapReplays;
