import * as db from './lib/db';
import { logInfo } from './lib/logger';

const NodeCache = require('node-cache');

export const dbCache = new NodeCache();

export const getMapsCache = async () => {
    const cachedMaps = dbCache.get('maps');

    if (cachedMaps) {
        return cachedMaps;
    }

    logInfo('mapsCache: Initializing cache');

    const maps = await db.getMapsStats();
    dbCache.set('maps', maps);
    return maps;
};

export const addReplay = async (metadata: any) => {
    await getMapsCache().then((cachedMaps: any) => {
        const mapCacheMatch = cachedMaps.find((map: any) => map.mapUId === metadata.mapUId);

        if (mapCacheMatch) {
            logInfo('mapsCache: saveReplayMetadata: map found in cache, incrementing play count');
            mapCacheMatch.count++;
            mapCacheMatch.lastUpdate = metadata.date;
        } else {
            logInfo('mapsCache: saveReplayMetadata: map not found in cache, adding to cache');
            cachedMaps.push({
                mapUId: metadata.mapUId,
                mapName: metadata.mapName,
                count: 1,
                lastUpdate: metadata.date,
            });
        }
        dbCache.set('maps', cachedMaps);
    });
};

export const deleteReplay = async (replay: any) => {
    await getMapsCache().then((cachedMaps: any) => {
        const mapCacheMatch = cachedMaps.find((map: any) => map.mapUId === replay.mapUId);
        if (mapCacheMatch) {
            mapCacheMatch.count--;
            if (mapCacheMatch.count === 0) {
                logInfo('mapsCache: deleteReplayById: map play count is 0, deleting map from cache');
                cachedMaps.splice(cachedMaps.indexOf(mapCacheMatch), 1);
            } else {
                logInfo('mapsCache: deleteReplayById: decrementing map play count');
            }
            dbCache.set('maps', cachedMaps);
        }
    });
};
