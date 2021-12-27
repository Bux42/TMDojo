import { useQuery } from 'react-query';
import queryClient from '../../../utils/reactQuery/queryClient';
import QUERY_KEYS from '../../../utils/reactQuery/reactQueryKeys';
import api from '../../apiWrapper';

const useUserReplays = (userId?: string) => useQuery(
    QUERY_KEYS.userReplays(userId),
    () => api.users.getUserReplays(userId || ''),
    {
        ...queryClient.getDefaultOptions(),
        enabled: userId !== undefined,
    },
);

export default useUserReplays;
