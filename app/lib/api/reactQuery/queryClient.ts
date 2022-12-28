import { QueryClient } from '@tanstack/react-query';
import logErrorResponse from '../../utils/logging';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            onError: logErrorResponse,
            refetchOnWindowFocus: false,
        },
        mutations: {
            onError: logErrorResponse,
        },
    },
});

export default queryClient;
