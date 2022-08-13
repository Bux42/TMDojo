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
