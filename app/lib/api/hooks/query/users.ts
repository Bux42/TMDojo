import { useQuery } from 'react-query';
import queryClient from '../../reactQuery/queryClient';
import QUERY_KEYS from '../../reactQuery/queryKeys';
import API from '../../apiWrapper';

export const useUserReplays = (userId?: string) => useQuery(
    QUERY_KEYS.userReplays(userId),
    () => API.users.getUserReplays(userId || ''),
    {
        ...queryClient.getDefaultOptions(),
        enabled: userId !== undefined,
    },
);

export const useUserInfo = (webId?: string) => useQuery(
    QUERY_KEYS.userInfo(webId),
    () => API.users.getUserInfo(webId || ''),
    {
        ...queryClient.getDefaultOptions(),
        enabled: webId !== undefined,
        staleTime: 60 * 1000, // long stale time, user info should never really change
    },
);
