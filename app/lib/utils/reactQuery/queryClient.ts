import { QueryClient } from 'react-query';
import logErrorResponse from '../logging';

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
