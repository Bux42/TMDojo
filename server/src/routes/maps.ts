/** Map data model
 * - _id
 * - mapName
 * - mapUId
 * - authorName
 * - thumbnailURL (not implemented yet)
 */

import { Request, Response } from 'express';
import * as express from 'express';

import axios from 'axios';

import * as db from '../lib/db';
import * as artefacts from '../lib/artefacts';

const router = express.Router();
/**
 * GET /maps
 * Retrieves paginated map stats
 * Query params:
 * - mapName (optional)
 * - offset (optional, default: 0)
 * - limit (optional, default: 50)
 * - sortBy (optional: map_name | last_updated | replay_count, default: last_updated)
 * - sortOrder (optional: asc | desc, default: desc)
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
    try {
        const offset = parseInt(req.query.offset as string || '0', 10);
        const limit = parseInt(req.query.limit as string || '50', 10);
        const sortByQuery = req.query.sortBy as string | undefined;
        const sortOrderQuery = req.query.sortOrder as string | undefined;
        const sortBy: db.MapSortBy = (sortByQuery === 'map_name'
            || sortByQuery === 'last_updated'
            || sortByQuery === 'replay_count')
            ? sortByQuery
            : 'last_updated';
        const sortOrder: db.SortOrder = (sortOrderQuery === 'asc' || sortOrderQuery === 'desc')
            ? sortOrderQuery
            : 'desc';

        const result = await db.getPaginatedMaps(
            req.query.mapName as string,
            offset,
            limit,
            sortBy,
            sortOrder,
        );
        res.send(result);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /maps/count
 * Retrieves total count of maps
 * Query params:
 * - mapName (optional) - filters by map name
 */
router.get('/count', async (req: Request, res: Response, next: Function) => {
    try {
        const totalMaps = await db.getTotalMapCount(req.query.mapName as string);
        res.send({ total: totalMaps });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /maps/replays/count
 * Retrieves total count of replays (excluding private replays)
 */
router.get('/replays/count', async (req: Request, res: Response, next: Function) => {
    try {
        const totalReplays = await db.getTotalReplayCount();
        res.send({ total: totalReplays });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /maps/:mapUID
 * Retrieves map (block) data by mapUID
 */
router.get('/:mapUID', async (req: Request, res: Response, next: Function) => {
    try {
        const mapData = await artefacts.retrieveMap(req.params.mapUID);
        res.send(mapData);
    } catch (err) {
        if (err?.message === 'Object not found') {
            res.status(404).send();
        } else {
            next(err);
        }
    }
});

/**
 * GET /maps/:mapUID/info
 * Retrieves map's metadata (including tm.io information)
 */
router.get('/:mapUID/info', async (req: Request, res: Response) => {
    let mapData = {};

    if (!req.user) {
        // Only call tm.io if user is authenticated
        res.status(401).send();
    } else {
        // fetch tm.io data
        try {
            const tmxRes = await axios.get(`https://trackmania.io/api/map/${req.params.mapUID}`, {
                withCredentials: true,
                headers: { 'User-Agent': 'TMDojo API - https://github.com/Bux42/TMDojo' },
            });

            const tmioData = tmxRes.data;
            mapData = { ...mapData, ...tmioData };
        } catch (error) {
            req.log.error(`mapsRouter: tm.io request failed with error ${error.toString()}`);
        }
        res.send(mapData);
    }
});

/**
 * POST /maps/:mapUID
 * Stores map (block) data (from the request body)
 */
router.post('/:mapUID', (req: Request, res: Response, next: Function) => {
    let completeData = '';

    req.on('data', (data) => {
        completeData += data;
    });

    req.on('end', async () => {
        try {
            req.log.debug('mapsRouter: Received map data, uploading');
            const buff = Buffer.from(completeData);
            await artefacts.uploadMap(req.params.mapUID, buff);
            res.send();
        } catch (err) {
            next(err);
        }
    });

    req.on('error', (err) => {
        next(err);
    });
});

export default router;
