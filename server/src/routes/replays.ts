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
            req.log.error(`replaysRouter: Replay with id "${req.params.replayId}" not found in the database`);
            throw new Error('Object not found');
        }
        const replayData = await artefacts.retrieveReplay(replay);
        req.log.debug('replaysRouter: Replay data retrieved');
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
    if (!req.user || req.user.webId !== req.query.webId) {
        // reject replay uploads by unauthenticated users
        req.log.error('replaysRouter: Unauthenticated replay upload attempt');
        return res.status(401).send('Authentication required to submit replay.');
    }

    const paramNames = [
        'authorName',
        'mapName',
        'mapUId',
        'endRaceTime',
        'raceFinished',
        'playerName',
        'playerLogin',
        'webId',
    ];

    // make sure all required parameters are present
    let requestValid = true;
    paramNames.forEach((paramName) => {
        if (!Object.prototype.hasOwnProperty.call(req.query, paramName)) {
            requestValid = false;
        }
    });
    if (!requestValid) {
        req.log.error('replaysRouter: Missing required parameters');
        return res.status(400).send('Request is missing one or more parameters');
    }

    const secureMapName = decodeURIComponent(req.query.mapName as string);

    let completeData = '';
    req.on('data', (data: string | Buffer) => {
        completeData += data;
    });

    req.on('end', async () => {
        req.log.debug('replaysRouter: Received replay data');
        try {
            const fileName = `${req.query.endRaceTime}_${req.query.playerName}_${Date.now()}`;
            const filePath = `${req.query.authorName}/${req.query.mapName}/${fileName}`;
            const storedReplay = await artefacts.uploadReplay(filePath, completeData);
            req.log.debug('replaysRouter: Replay data stored');

            // check if map already exists
            let map = await db.getMapByUId(`${req.query.mapUId}`);
            if (!map) {
                req.log.debug('replaysRouter: Map does not exist in database, creating new map');
                map = await db.saveMap({
                    mapName: secureMapName,
                    mapUId: req.query.mapUId,
                    authorName: req.query.authorName,
                });
            }

            // check if user already exists
            const user = await db.getUserByWebId(`${req.query.webId}`);
            const userID = user?._id;

            // parse sector times
            // convert string of sector times separated by ',' to array of numbers
            // "1,2,3" -> [1, 2, 3]
            let sectorTimes = null;
            if (req.query.sectorTimes && typeof req.query.sectorTimes === 'string') {
                const sectorTimesList: string[] = (req.query.sectorTimes as string).split(',');

                try {
                    sectorTimes = sectorTimesList.map((time) => parseInt(time, 10));
                } catch (e) {
                    req.log.error(`Could not parse sector times (${req.query.sectorTimes}): ${e}`);
                }

                // Set sector times to null if they contain NaN values (parseInt returns NaN for non-numeric values)
                if (sectorTimes.filter((time) => Number.isNaN(time)).length > 0) {
                    // eslint-disable-next-line max-len
                    req.log.error(`Could not parse sector times (${req.query.sectorTimes}): ${sectorTimes} contains NaN`);
                    sectorTimes = null;
                }

                // Set sector times to null if the list is empty
                if (sectorTimes && sectorTimes.length === 0) {
                    sectorTimes = null;
                }
            }

            const metadata = {
                // reference map and user docs
                mapRef: map._id,
                mapUId: req.query.mapUId,
                mapName: secureMapName,
                userRef: userID,
                date: Date.now(),
                raceFinished: parseInt(`${req.query.raceFinished}`, 10),
                endRaceTime: parseInt(`${req.query.endRaceTime}`, 10),
                pluginVersion: req.query.pluginVersion,
                sectorTimes,
                ...storedReplay,
            };
            req.log.debug('replaysRouter: Saving replay metadata');
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

    if (!replay) {
        req.log.error('replaysRouter: Failed to delete replay, replay not found');
        res.status(404).send('Failed to delete replay, replay not found.');
        return;
    }

    const replayUser = await db.getUserById(replay.userRef);

    // Check user
    const { user } = req;
    if (user === undefined || user.webId !== replayUser.webId) {
        req.log.error('replaysRouter: Unauthenticated replay delete attempt');
        res.status(401).send('Authentication required to delete replay.');
        return;
    }

    await db.deleteReplayById(replay._id);

    try {
        req.log.debug('replaysRouter: Deleted replay metadata, now deleting replay file');
        await artefacts.deleteReplay(replay);
    } catch (err) {
        req.log.warn('replaysRouter: Failed to delete replay file, restoring metadata in database');
        // If deletion failed, add the replay back into the DB
        await db.saveReplayMetadata(replay);

        res.status(500).send('Failed to delete replay file.');
        return;
    }

    res.send();
});

export default router;
