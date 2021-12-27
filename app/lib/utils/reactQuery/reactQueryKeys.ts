const QUERY_KEYS = {
    allMaps: (searchString: string = '') => (searchString !== '' ? ['allMaps', searchString] : 'allMaps'),
};

export default QUERY_KEYS;
