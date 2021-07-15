/** Replay data model
 * - _id
 * - userRef
 * - mapRef
 * - endRaceTime
 * - raceFinished
 * - filePath
 * - date
 */

const express = require('express');

const router = express.Router();

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const db = require('../lib/db');

/**
 * GET /replays
 * Retrieves filtered replay metadata
 * Query params:
 * - mapName (optional)
 * - playerName (optional)
 * - mapUId (optional)
 * - raceFinished (optional)
 * - orderBy (optional)
 * - maxResults (optional)
 * - endRaceTimeMin (optional) - currently unused
 * - endRaceTimeMax (optional) - currently unused
 * - dateMin (optional) - currently unused
 */
router.get('/', async (req, res, next) => {
    try {
        const replays = await db.getReplays(
            req.query.mapName,
            req.query.playerName,
            req.query.mapUId,
            req.query.raceFinished,
            req.query.orderBy,
            req.query.maxResults,
        );
        res.send(replays);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /replays/:replayId
 * Retrieves a replay file by the replay's id (defined as the MongoDB document's "_id" property)
 * Query params:
 * - download (optional)
 * - fileName (optional)
 */
router.get('/:replayId', async (req, res, next) => {
    try {
        const replay = await db.getReplayById(req.params.replayId);
        const filePath = path.resolve(`${__dirname}/../${replay.filePath}`);
        if (fs.existsSync(filePath)) {
            if (req.query.download === 'true') {
                res.download(filePath, req.query.fileName || req.params.replayId);
            } else {
                const file = fs.readFileSync(filePath);
                const unzipped = zlib.unzipSync(file);
                res.send(unzipped);
            }
        } else {
            res.status(404).send();
        }
    } catch (err) {
        next(err);
    }
});

/**
 * GET /replays/:replayId/export
 * Exports a replay file including its metadata
 */
router.get('/:replayId/export', async (req, res, next) => {
    try {
        const replay = await db.getReplayById(req.params.replayId, true);
        const filePath = path.resolve(`${__dirname}/../${replay.filePath}`);
        if (fs.existsSync(filePath)) {
            const contents = fs.readFileSync(filePath, {
                encoding: 'base64',
            });
            replay.base64 = contents;
            delete replay._id; // remove id so importing can't lead to conflicts
            delete replay.filePath; // remove filePath because it's just internal structure

            const fileData = JSON.stringify(replay);
            const fileName = `${req.params.replayId}.json`;
            const fileType = 'application/json';

            // set headers to make requester think this is a file download
            res.writeHead(200, {
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Type': fileType,
            });

            const download = Buffer.from(fileData, 'utf8');
            res.end(download);
        } else {
            res.status(404).send();
        }
    } catch (err) {
        next(err);
    }
});

/**
 * POST /replays
 * Stores replay data (from the request body)
 * Query params:
 * - authorName
 * - mapName
 * - mapUId
 * - endRaceTime
 * - raceFinished
 * - playerName
 * - playerLogin
 * - webId
 */
// eslint-disable-next-line consistent-return
router.post('/', (req, res, next) => {
    const paramNames = [
        'authorName', 'mapName', 'mapUId', 'endRaceTime', 'raceFinished', 'playerName', 'playerLogin', 'webId',
    ];

    // make sure all required parameters are present
    let requestValid = true;
    paramNames.forEach((paramName) => {
        if (!Object.prototype.hasOwnProperty.call(req.query, paramName)) {
            requestValid = false;
        }
    });
    if (!requestValid) {
        return res.status(400).send({ message: 'Request is missing one or more parameters' });
    }

    const secureMapName = decodeURIComponent(req.query.mapName);

    // prepare directories
    if (!fs.existsSync(`maps/${req.query.authorName}`)) {
        fs.mkdirSync(`maps/${req.query.authorName}`);
    }
    if (!fs.existsSync(`maps/${req.query.authorName}/${secureMapName}`)) {
        fs.mkdirSync(`maps/${req.query.authorName}/${secureMapName}`);
    }

    let completeData = '';
    req.on('data', (data) => {
        completeData += data;
    });

    req.on('end', () => {
        const buff = Buffer.from(completeData, 'base64');
        const fileName = `${req.query.endRaceTime}_${req.query.playerName}_${Date.now()}`;
        const filePath = `maps/${req.query.authorName}/${req.query.mapName}/${fileName}.gz`;

        fs.writeFile(filePath, zlib.gzipSync(buff), async (writeErr) => {
            if (writeErr) {
                return next(writeErr);
            }

            console.log('POST /replays: The file was saved at', filePath);

            try {
                // check if map already exists
                let map = await db.getMapByUId(req.query.mapUId);
                if (!map) {
                    map = await db.saveMap({
                        mapName: secureMapName,
                        mapUId: req.query.mapUId,
                        authorName: req.query.authorName,
                    });
                }

                // check if user already exists
                let user = await db.getUserByWebId(req.query.webId);
                if (!user) {
                    user = await db.saveUser({
                        playerName: req.query.playerName,
                        playerLogin: req.query.playerLogin,
                        webId: req.query.webId,
                    });
                }

                const metadata = {
                    // reference map and user docs
                    mapRef: map._id,
                    userRef: user._id,
                    filePath,
                    date: Date.now(),
                    raceFinished: parseInt(req.query.raceFinished, 10),
                    endRaceTime: parseInt(req.query.endRaceTime, 10),
                };
                await db.saveReplayMetadata(metadata);
                return res.send();
            } catch (dbErr) {
                return next(dbErr);
            }
        });
    });

    req.on('error', (err) => next(err));
});

/**
 * POST /replays/import
 * Stores replay data from an exported replay
 */
router.post('/import', (req, res, next) => {
    let completeData = '';

    req.on('data', (data) => {
        completeData += data;
    });

    req.on('end', async () => {
        const importData = JSON.parse(completeData);

        // prepare directory structure
        const pathFragments = ['maps', importData.authorName, importData.mapName];
        let currentPath = '';
        for (let i = 0; i < pathFragments.length; i++) {
            currentPath += `${pathFragments[i]}/`;
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
                console.log('POST /replays/import: Created directory', currentPath);
            }
        }

        const fileName = `${importData.endRaceTime}_${importData.playerName}_${importData.date}`;
        const filePath = `maps/${importData.authorName}/${importData.mapName}/${fileName}`;

        // check if exact filepath is already in db (this assume db is synced with file system)
        const replay = await db.getReplayByFilePath(filePath);
        if (!replay) {
            const buffer = Buffer.from(importData.base64, 'base64');
            fs.writeFile(filePath, buffer, async (err) => {
                if (err) {
                    return next(err);
                }
                console.log('POST /replays/import: The file was saved at', filePath);

                // TODO: clean this up since it's basically the same as for POST /replays
                try {
                    // check if map already exists
                    let map = await db.getMapByUId(importData.mapUId);
                    if (!map) {
                        map = await db.saveMap({
                            mapName: importData.mapName,
                            mapUId: importData.mapUId,
                            authorName: importData.authorName,
                        });
                    }

                    // check if user already exists
                    let user = await db.getUserByWebId(importData.webId);
                    if (!user) {
                        user = await db.saveUser({
                            playerName: importData.playerName,
                            playerLogin: importData.playerLogin,
                            webId: req.query.webId,
                        });
                    }

                    const metadata = {
                        mapRef: map._id,
                        userRef: user._id,
                        filePath,
                        date: Date.now(),
                        raceFinished: parseInt(importData.raceFinished, 10),
                        endRaceTime: parseInt(importData.endRaceTime, 10),
                    };
                    await db.saveReplayMetadata(metadata);
                    return res.send();
                } catch (dbErr) {
                    return next(dbErr);
                }
            });
        } else {
            console.log('POST /replays/import: Replay already exists, skipping import');
            res.status(400).send(JSON.stringify({ message: 'This replay file is already present on the server.' }));
        }
    });

    req.on('error', (err) => {
        next(err);
    });
});

module.exports = router;
