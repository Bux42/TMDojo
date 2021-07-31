/** Map data model
 * - _id
 * - mapName
 * - mapUId
 * - authorName
 * - thumbnailURL (not implemented yet)
 * - filePath (not implemented yet)
 * - objectPath (not implemented yet)
 */

const express = require('express');

const router = express.Router();
const axios = require('axios');

const db = require('../lib/db');
const artefacts = require('../lib/artefacts');

/**
 * GET /maps
 * Retrieves all unique map names we have replays of
 * Query params:
 * - mapName (optional)
 */
router.get('/', async (req, res, next) => {
    try {
        const mapNames = await db.getUniqueMapNames(req.query.mapName);
        res.send(mapNames);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /maps/:mapUID
 * Retrieves map (block) data by mapUID
 */
router.get('/:mapUID', async (req, res, next) => {
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
router.post('/:mapUID', (req, res, next) => {
    let completeData = '';

    req.on('data', (data) => {
        completeData += data;
    });

    req.on('end', async () => {
        try {
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

module.exports = router;
