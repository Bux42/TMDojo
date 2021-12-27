const QUERY_KEYS = {
    allMaps: (searchString: string = '') => (searchString !== '' ? ['allMaps', searchString] : 'allMaps'),
    mapReplays: (mapUId?: string) => (mapUId && mapUId !== '' ? ['mapReplays', mapUId] : 'mapReplays'),
    mapInfo: (mapUId?: string) => (mapUId && mapUId !== '' ? ['mapInfo', mapUId] : 'mapInfo'),
    userReplays: (userId?: string) => (userId && userId !== '' ? ['userReplays', userId] : 'userReplays'),
    userInfo: (webId?: string) => (webId && webId !== '' ? ['userInfo', webId] : 'userInfo'),
};

export default QUERY_KEYS;
