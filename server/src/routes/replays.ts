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

import { Request, Response } from 'express';
import * as express from 'express';

import * as db from '../lib/db';
import * as artefacts from '../lib/artefacts';

const router = express.Router();
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
router.get('/', async (req: Request, res: Response, next: Function) => {
    try {
        const replays = await db.getReplays(
            req.query.mapName as string,
            req.query.playerName as string,
            req.query.mapUId as string,
            req.query.raceFinished as string,
            req.query.orderBy as string,
            req.query.maxResults as string,
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
router.get('/:replayId', async (req: Request, res: Response, next: Function) => {
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
router.post('/', (req: Request, res: Response, next: Function): any => {
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

    const secureMapName = decodeURIComponent(req.query.mapName as string);

    let completeData = '';
    req.on('data', (data: string | Buffer) => {
        completeData += data;
    });

    req.on('end', async () => {
        try {
            const fileName = `${req.query.endRaceTime}_${req.query.playerName}_${Date.now()}`;
            const filePath = `${req.query.authorName}/${req.query.mapName}/${fileName}`;
            const storedReplay = await artefacts.uploadReplay(filePath, completeData);

            // check if map already exists
            let map = await db.getMapByUId(`${req.query.mapUId}`);
            if (!map) {
                map = await db.saveMap({
                    mapName: secureMapName,
                    mapUId: req.query.mapUId,
                    authorName: req.query.authorName,
                });
            }

            // check if user already exists
            let user = await db.getUserByWebId(`${req.query.webId}`);
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
                raceFinished: parseInt(`${req.query.raceFinished}`, 10),
                endRaceTime: parseInt(`${req.query.endRaceTime}`, 10),
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

/**
 * DELETE /replays/:replayId
 * Deletes a replay file
 */
router.delete('/:replayId', async (req, res) => {
    // Fetch replay
    const replay = await db.getReplayById(req.params.replayId);
    const replayUser = await db.getUserById(replay.userRef);

    // Check user
    const { user } = req;
    if (user === undefined || user.webId !== replayUser.webId) {
        res.status(401).send('Not authorized to delete replay.');
        return;
    }

    await db.deleteReplayById(replay._id);

    try {
        await artefacts.deleteReplay(replay);
    } catch (err) {
        // If deletion failed, add the replay back into the DB
        await db.saveReplay(replay);

        res.status(500).send('Failed to delete replay file.');
        return;
    }

    res.send();
});

export default router;
