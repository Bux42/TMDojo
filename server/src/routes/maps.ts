/** Map data model
 * - _id
 * - mapName
 * - mapUId
 * - authorName
 * - thumbnailURL (not implemented yet)
 */

import { Request, Response } from 'express'
import * as express from 'express';


import axios from 'axios';

import * as fs from 'fs';
import * as path from 'path';

import * as db from '../lib/db';

const router = express.Router();
/**
 * GET /maps
 * Retrieves all unique map names we have replays of
 * Query params:
 * - mapName (optional)
 */
router.get('/', async (req : Request, res : Response, next : Function) => {
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
router.get('/:mapUID', async (req : Request, res : Response, next : Function) => {
    try {
        if (fs.existsSync(`mapBlocks/${req.params.mapUID}`)) {
            res.sendFile(path.resolve(`${__dirname}/../mapBlocks/${req.params.mapUID}`));
        } else {
            res.status(404).send();
        }
    } catch (err) {
        next(err);
    }
});

/**
 * GET /maps/:mapUID/info
 * Retrieves map's metadata (including tm.io information)
 */
router.get('/:mapUID/info', async (req, res) => {
    let mapData = {};

    // fetch tm.io data
    try {
        const tmxRes = await axios.get(`https://trackmania.io/api/map/${req.params.mapUID}`, {
            withCredentials: true,
            headers: { 'User-Agent': 'TMDojo API - https://github.com/Bux42/TMDojo' },
        });

        const tmioData = tmxRes.data;
        mapData = { ...mapData, ...tmioData };
    } catch (error) {
        console.log('/maps/:mapUID/info: tm.io request failed with error ', error.toString());
    }

    res.send(mapData);
});

/**
 * POST /maps/:mapUID
 * Stores map (block) data (from the request body)
 */
router.post('/:mapUID', (req : Request, res : Response, next : Function) => {
    let completeData = '';

    req.on('data', (data) => {
        completeData += data;
    });

    req.on('end', () => {
        const buff = Buffer.from(completeData, 'base64');
        const filePath = `mapBlocks/${req.params.mapUID}`;
        fs.writeFile(filePath, buff, (err) => {
            if (err) {
                return next(err);
            }
            console.log(`POST /maps/${req.params.mapUID}: The file was saved at`, filePath);
            return res.send();
        });
    });

    req.on('error', (err) => {
        next(err);
    });
});

export default router;
