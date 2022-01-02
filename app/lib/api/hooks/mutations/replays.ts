import { QueryClient, useMutation } from 'react-query';
import QUERY_KEYS from '../../../utils/reactQuery/reactQueryKeys';
import api from '../../apiWrapper';
import { ReplayInfo } from '../../requests/replays';

const useDeleteReplayMutation = (queryClient: QueryClient) => useMutation<void, any, ReplayInfo, unknown>(
    api.replays.deleteReplay,
    {
        onSuccess: () => {
            queryClient.invalidateQueries(QUERY_KEYS.mapReplays()); // TODO: use mapUId from replay
            queryClient.invalidateQueries(QUERY_KEYS.userReplays());
        },
    },
);

export default useDeleteReplayMutation;
