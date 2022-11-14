import { QueryClient, useMutation } from 'react-query';
import QUERY_KEYS from '../../../utils/reactQuery/reactQueryKeys';
import api from '../../apiWrapper';
import { AllReplaysResult } from '../../requests/replays';

const useDeleteReplayMutation = (queryClient: QueryClient) => useMutation(
    api.replays.deleteReplay,
    {
        onSuccess: (_, replay) => {
            // Optimistic update of query data
            queryClient.setQueryData(QUERY_KEYS.mapReplays(replay.mapUId),
                (oldData?: AllReplaysResult) => {
                    // Should never happen, if a replay is deleted, old data should exist
                    if (!oldData) {
                        return { replays: [], totalResults: 0 };
                    }

                    // Remove deleted replay
                    return {
                        replays: oldData.replays.filter((r) => r._id !== replay._id),
                        totalResults: oldData.totalResults - 1,
                    };
                });

            // Invalidate queries to force refetch from server
            queryClient.invalidateQueries(QUERY_KEYS.mapReplays(replay.mapUId));
            queryClient.invalidateQueries(QUERY_KEYS.userReplays());
        },
    },
);

export default useDeleteReplayMutation;
