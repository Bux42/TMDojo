import { useQuery } from 'react-query';
import queryClient from '../../../utils/reactQuery/queryClient';
import QUERY_KEYS from '../../../utils/reactQuery/reactQueryKeys';
import api from '../../apiWrapper';

export const useUserReplays = (userId?: string) => useQuery(
    QUERY_KEYS.userReplays(userId),
    () => api.users.getUserReplays(userId || ''),
    {
        ...queryClient.getDefaultOptions(),
        enabled: userId !== undefined,
    },
);

export const useUserInfo = (webId?: string) => useQuery(
    QUERY_KEYS.userInfo(webId),
    () => api.users.getUserInfo(webId || ''),
    {
        ...queryClient.getDefaultOptions(),
        enabled: webId !== undefined,
        staleTime: 60 * 1000, // long stale time, user info should never really change
    },
);
