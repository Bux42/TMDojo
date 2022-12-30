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
const getMapInputSchema = z.object({
    params: z.object({
        mapUID: z.string(),
    }),
});

router.get('/:mapUID/blocks', async (req: Request, res: Response, next: Function) => {
    const { params: { mapUID } } = zParseRequest(getMapInputSchema, req);

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
router.get('/:mapUID/info', async (req: Request, res: Response) => {
    let mapData = {};

    // fetch tm.io data
    try {
        const tmxRes = await axios.get(`https://trackmania.io/api/map/${req.params.mapUID}`, {
            withCredentials: true,
            headers: { 'User-Agent': 'TMDojo API - https://github.com/Bux42/TMDojo' },
        });

        const tmioData = tmxRes.data;
        mapData = { ...mapData, ...tmioData };
    } catch (error: any) {
        req.log.error(`mapsRouter: tm.io request failed with error ${error.toString()}`);
    }

    res.send(mapData);
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
