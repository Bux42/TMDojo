const QUERY_KEYS = {
    allMaps: (searchString: string = '') => {
        if (searchString !== '') {
            return ['allMaps', searchString] as const;
        }
        return ['allMaps'];
    },
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
