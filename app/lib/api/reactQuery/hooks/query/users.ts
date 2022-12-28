import { useQuery } from '@tanstack/react-query';
import queryClient from '../../queryClient';
import QUERY_KEYS from '../../queryKeys';
import API from '../../../apiWrapper';

const useUserInfo = (webId?: string) => useQuery(
    QUERY_KEYS.userInfo(webId),
    () => API.users.getUserInfo(webId || ''),
    {
        ...queryClient.getDefaultOptions(),
        enabled: webId !== undefined,
        staleTime: 60 * 1000, // long stale time, user info should never really change
    },
);

export default useUserInfo;
