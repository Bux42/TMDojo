import { useQuery } from 'react-query';
import QUERY_KEYS from '../../../utils/reactQuery/reactQueryKeys';
import api from '../../apiWrapper';

const useAllMaps = (searchString: string = '') => useQuery(
    QUERY_KEYS.allMaps(searchString),
    () => api.maps.getAllMaps(searchString),
);

export default useAllMaps;
