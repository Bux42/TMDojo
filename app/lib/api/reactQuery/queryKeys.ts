const QUERY_KEYS = {
    allMaps: (
        searchString: string = '',
        offset: number = 0,
        limit: number = 50,
        sortBy: 'map_name' | 'last_updated' | 'replay_count' = 'last_updated',
        sortOrder: 'desc' | 'asc' = 'desc',
    ) =>
        ['allMaps', searchString, offset, limit, sortBy, sortOrder] as const,
    mapCount: (searchString: string = '') =>
        ['mapCount', searchString] as const,
    replayCount: () =>
        ['replayCount'] as const,
    mapReplays: (mapUId?: string) => {
        if (mapUId && mapUId !== '') {
            return ['mapReplays', mapUId] as const;
        }
        return ['mapReplays'];
    },
    mapInfo: (mapUId?: string) => {
        if (mapUId && mapUId !== '') {
            return ['mapInfo', mapUId] as const;
        }
        return ['mapInfo'];
    },
    userReplays: (userId?: string) => {
        if (userId && userId !== '') {
            return ['userReplays', userId] as const;
        }
        return ['userReplays'];
    },
    userInfo: (webId?: string) => {
        if (webId && webId !== '') {
            return ['userInfo', webId] as const;
        }
        return ['userInfo'];
    },
};

export default QUERY_KEYS;
