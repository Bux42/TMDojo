const QUERY_KEYS = {
    allMaps: (searchString: string = '') => (
        (searchString !== '' ? ['allMaps', searchString] as const : 'allMaps')
    ),
    mapReplays: (mapUId?: string) => (
        mapUId && mapUId !== '' ? ['mapReplays', mapUId] as const : 'mapReplays'
    ),
    mapInfo: (mapUId?: string) => (
        mapUId && mapUId !== '' ? ['mapInfo', mapUId] as const : 'mapInfo'
    ),
    userReplays: (userId?: string) => (
        userId && userId !== '' ? ['userReplays', userId] as const : 'userReplays'
    ),
    userInfo: (webId?: string) => (
        webId && webId !== '' ? ['userInfo', webId] as const : 'userInfo'
    ),
};

export default QUERY_KEYS;
