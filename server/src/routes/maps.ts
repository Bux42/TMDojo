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

import { z } from 'zod';
import * as db from '../lib/db';
import * as artefacts from '../lib/artefacts';
import { asyncErrorHandler } from '../lib/asyncErrorHandler';
import zParseRequest from '../lib/zodParseRequest';
import { HttpError } from '../lib/httpErrors';

const router = express.Router();
/**
 * GET /maps
 * Retrieves all unique map names we have replays of
 * Query params:
 * - mapName (optional)
 */
const getMapsInputSchema = z.object({
    query: z.object({
        mapName: z.string().optional(),
    }),
});

router.get('/', asyncErrorHandler(async (req: Request, res: Response) => {
    const { query: { mapName } } = zParseRequest(getMapsInputSchema, req);

    const mapNames = await db.getUniqueMapNames(mapName);

    res.send(mapNames);
}));

/**
 * GET /maps/:mapUID
 * Retrieves map (block) data by mapUID
 */
const getMapBlocksInputSchema = z.object({
    params: z.object({
        mapUID: z.string(),
    }),
});

// TODO: use asyncErrorHandler to handle errors correctly
router.get('/:mapUID/blocks', async (req: Request, res: Response, next: Function) => {
    const { params: { mapUID } } = zParseRequest(getMapBlocksInputSchema, req);

    try {
        const mapData = await artefacts.retrieveMap(mapUID);
        res.send(mapData);
    } catch (err: any) {
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
const getMapInfoInputSchema = z.object({
    params: z.object({
        mapUID: z.string(),
    }),
});

router.get(['/:mapUID', '/:mapUID/info'], asyncErrorHandler(async (req: Request, res: Response) => {
    const { params: { mapUID } } = zParseRequest(getMapInfoInputSchema, req);

    try {
        // Fetch tm.io data
        const tmioRes = await axios.get(`https://trackmania.io/api/map/${mapUID}`, {
            withCredentials: true,
            headers: { 'User-Agent': 'TMDojo API - https://github.com/Bux42/TMDojo' },
        });

        if (!tmioRes || !tmioRes.data) {
            throw new HttpError(404, `Map not found: ${mapUID}`);
        }

        res.send(tmioRes.data);
    } catch (error: any) {
        // Let HttpError bubble up
        if (error instanceof HttpError) throw error;

        req.log.error('mapsRouter: TM.io map request failed');
        if (error.config) delete error.config; // Avoid logging sensitive data from the config
        req.log.error(error);

        // Map still not found, so return a 404
        throw new HttpError(404, `Map not found: ${mapUID}`);
    }
}));

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
