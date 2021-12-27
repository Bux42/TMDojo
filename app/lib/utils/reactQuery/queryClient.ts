import { QueryClient } from 'react-query';
import logErrorResponse from '../logging';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            onError: logErrorResponse,
        },
        mutations: {
            onError: logErrorResponse,
        },
    },
});

export default queryClient;
