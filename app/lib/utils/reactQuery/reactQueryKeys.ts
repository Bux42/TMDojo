const QUERY_KEYS = {
    allMaps: (searchString: string = '') => (searchString !== '' ? ['allMaps', searchString] : 'allMaps'),
    mapReplays: (mapUId?: string) => (mapUId && mapUId !== '' ? ['mapReplays', mapUId] : 'mapReplays'),
};

export default QUERY_KEYS;
