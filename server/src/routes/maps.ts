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
 * Retrieves all unique map names we have replays of
 * Query params:
 * - mapName (optional)
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
    try {
        const mapNames = await db.getUniqueMapNames(req.query.mapName as string);
        res.send(mapNames);
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
