const QUERY_KEYS = {
    allMaps: (searchString: string = '') => (searchString !== '' ? ['allMaps', searchString] : 'allMaps'),
    mapReplays: (mapUId?: string) => (mapUId && mapUId !== '' ? ['mapReplays', mapUId] : 'mapReplays'),
    mapInfo: (mapUId?: string) => (mapUId && mapUId !== '' ? ['mapInfo', mapUId] : 'mapInfo'),
};

export default QUERY_KEYS;
