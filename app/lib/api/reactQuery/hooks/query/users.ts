import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '../../queryClient';
import QUERY_KEYS from '../../queryKeys';
import API from '../../../apiWrapper';
import { TIME_IN_MS } from '../../../../utils/time';

const useUserInfo = (webId?: string) => useQuery(
    QUERY_KEYS.userInfo(webId),
    () => API.users.getUserInfo(webId || ''),
    {
        ...queryClient.getDefaultOptions(),
        enabled: webId !== undefined,
        staleTime: TIME_IN_MS.HOUR, // Long stale time, user info should never really change
    },
);

const useSetUserPrivateReplays = (webId: string) => useMutation(
    (privateReplays: boolean) => API.users.setPrivateReplays(webId, privateReplays),
    {
        onSuccess: () => {
            queryClient.invalidateQueries(QUERY_KEYS.userInfo(webId));
        },
    },
);

export { useSetUserPrivateReplays, useUserInfo };
