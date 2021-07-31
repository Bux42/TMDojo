/** Replay data model
 * - _id
 * - userRef
 * - mapRef
 * - endRaceTime
 * - raceFinished
 * - filePath (optional, XOR objectPath)
 * - objectPath (optional, XOR filePath)
 * - date
 */

const express = require('express');

const router = express.Router();

const db = require('../lib/db');
const artefacts = require('../lib/artefacts');

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
        if (!replay) {
            throw new Error('Object not found');
        }
        const replayData = await artefacts.retrieveReplay(replay);
        res.send(replayData);
    } catch (err) {
        if (err?.message === 'Object not found') {
            res.status(404).send();
        } else {
            next(err);
        }
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

    let completeData = '';
    req.on('data', (data) => {
        completeData += data;
    });

    req.on('end', async () => {
        try {
            const buff = Buffer.from(completeData);
            const fileName = `${req.query.endRaceTime}_${req.query.playerName}_${Date.now()}`;
            const filePath = `${req.query.authorName}/${req.query.mapName}/${fileName}`;
            const storedReplay = await artefacts.uploadReplay(filePath, buff);

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
                date: Date.now(),
                raceFinished: parseInt(req.query.raceFinished, 10),
                endRaceTime: parseInt(req.query.endRaceTime, 10),
                ...storedReplay,
            };

            await db.saveReplayMetadata(metadata);
            return res.send();
        } catch (err) {
            return next(err);
        }
    });

    req.on('error', (err) => next(err));
});

module.exports = router;
