import { useMutation } from '@tanstack/react-query';
import API from '../../../apiWrapper';
import queryClient from '../../queryClient';
import QUERY_KEYS from '../../queryKeys';

const useSetUserPrivateReplays = (webId: string) => useMutation(
    (privateReplays: boolean) => API.users.setPrivateReplays(webId, privateReplays),
    {
        onSuccess: () => {
            queryClient.invalidateQueries(QUERY_KEYS.userInfo(webId));
        },
    },
);

export default useSetUserPrivateReplays;
