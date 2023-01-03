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

import { z } from 'zod';
import * as db from '../lib/db';
import * as artefacts from '../lib/artefacts';
import zParseRequest from '../lib/zodParseRequest';
import { HttpError } from '../lib/httpErrors';
import { asyncErrorHandler } from '../lib/asyncErrorHandler';
import { logError } from '../lib/logger';
import streamToString from '../lib/streamToString';

const router = express.Router();
/**
 * GET /replays
 * Retrieves filtered replay metadata
 * Query params:
 * - mapName (optional)
 * - mapUId (optional)
 * - maxResults (optional)
 * - playerName (optional) - currently unused
 * - raceFinished (optional) - currently unused
 * - orderBy (optional) - currently unused
 * - endRaceTimeMin (optional) - currently unused
 * - endRaceTimeMax (optional) - currently unused
 * - dateMin (optional) - currently unused
 */
const getReplaysInputSchema = z.object({
    query: z.object({
        mapName: z.string().optional(),
        mapUId: z.string().optional(),
        maxResults: z.coerce.number().optional(),
        // The other query params will be added at a later date when implementing proper filtering and pagination
    }),
});

router.get('/', asyncErrorHandler(async (req: Request, res: Response) => {
    const {
        query: {
            mapName, mapUId, maxResults,
        },
    } = zParseRequest(getReplaysInputSchema, req);

    const replays = await db.getReplays({
        mapName,
        mapUId,
        maxResults,
    });

    res.send(replays);
}));

/**
 * GET /replays/:replayId
 * Retrieves a replay file by the replay's id (defined as the MongoDB document's "_id" property)
 * Query params:
 * - download (optional)
 * - fileName (optional)
 */
const getReplayInputSchema = z.object({
    params: z.object({
        replayId: z.string(),
    }),
});

router.get('/:replayId', asyncErrorHandler(async (req: Request, res: Response) => {
    const { params: { replayId } } = zParseRequest(getReplayInputSchema, req);

    try {
        const replay = await db.getReplayById(replayId);

        if (!replay) {
            req.log.error(`replaysRouter: Replay with id "${replayId}" not found in the database, throwing 404`);
            throw new HttpError(404, `Replay not found: ${replayId}`);
        }

        const replayData = await artefacts.retrieveReplay(replay);
        req.log.debug(`replaysRouter: Replay data retrieved: ${replayId}`);

        res.send(replayData);
    } catch (err: any) {
        if (err instanceof HttpError) throw err;

        req.log.error(`replaysRouter: Couldn't retrieve replay: ${replayId}`);
        req.log.error(err);

        throw new HttpError(404, `Replay not found: ${replayId}`);
    }
}));

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
const parsedSectorTimesInputSchema = z.string().optional().transform((string) => {
    if (!string) return undefined;
    if (typeof string !== 'string') return undefined;

    try {
        const parsed = string.split(',').map((s) => parseInt(s, 10));

        if (parsed.length === 0 || parsed.some((n) => (!Number.isInteger(n) || Number.isNaN(n) || n == null))) {
            logError(`Invalid sector times encountered while parsing: ${parsed}`);
            return undefined;
        }

        for (let i = 1; i < parsed.length; i += 1) {
            if (parsed[i - 1] > parsed[i]) {
                // eslint-disable-next-line max-len
                logError(`Invalid sector times encountered while parsing, value at index ${i - 1} (${parsed[i - 1]}) was bigger than the value at index ${i} (${parsed[i]}) in: ${parsed}`);
                return undefined;
            }
        }

        return parsed;
    } catch (e: any) {
        logError(`Error thrown while parsing sector times: ${e}`);
        return undefined;
    }
});

const uploadReplayInputSchema = z.object({
    query: z.object({
        authorName: z.string(),
        mapName: z.string(),
        mapUId: z.string(),
        endRaceTime: z.coerce.number(),
        raceFinished: z.string(),
        playerName: z.string(),
        webId: z.string(),
        pluginVersion: z.string().optional(),
        sectorTimes: parsedSectorTimesInputSchema,
    }),
});

router.post('/', asyncErrorHandler(async (req: Request, res: Response) => {
    const {
        query: {
            authorName, mapName, mapUId, endRaceTime, raceFinished, playerName, webId, pluginVersion, sectorTimes,
        },
    } = zParseRequest(uploadReplayInputSchema, req);

    // Reject replay uploads by unauthenticated users
    if (!req.user || req.user.webId !== webId) {
        req.log.error('replaysRouter: Unauthenticated replay upload attempt');
        throw new HttpError(401, 'Authentication required to submit replay.');
    }

    // Read replay data from request
    const replayDataAsString = await streamToString(req);

    // Upload replay file to S3
    const fileName = `${endRaceTime}_${playerName}_${Date.now()}`;
    const filePath = `${authorName}/${mapName}/${fileName}`;
    const storedReplay = await artefacts.uploadReplay(filePath, replayDataAsString);
    req.log.debug('replaysRouter: Replay data stored');

    // Check if map already exists
    let map = await db.getMapByUId(mapUId);
    const secureMapName = decodeURIComponent(mapName);
    if (!map) {
        req.log.debug('replaysRouter: Map does not exist in database, creating new map');
        map = await db.saveMap({
            mapName: secureMapName,
            mapUId,
            authorName,
        });
    }

    // Save replay metadata in database
    const metadata = {
        mapRef: map._id,
        mapUId,
        mapName: secureMapName,
        userRef: req.user._id,
        date: Date.now(),
        raceFinished,
        endRaceTime,
        pluginVersion,
        sectorTimes,
        ...storedReplay,
    };
    req.log.debug('replaysRouter: Saving replay metadata');
    const { _id } = await db.saveReplayMetadata(metadata);

    // Respond with saved replay entry
    const savedReplay = await db.getReplayById(_id);
    delete savedReplay.objectPath;
    return res.send(savedReplay);
}));

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
    if (!replayUser || user === undefined || user.webId !== replayUser.webId) {
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
