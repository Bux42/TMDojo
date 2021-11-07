/** Users data model
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

const router = express.Router();

/**
 * GET /users/:webId/info
 * Retrieves user infos by webId
 */
router.get('/:webId/info', async (req: Request, res: Response, next: Function) => {
    try {
        console.log('/:webId/info', req.params);
        const userInfos = await db.getUserByWebId(req.params.webId);
        console.log('userInfos', userInfos);
        res.send(userInfos);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /users/:userId/replays
 * Retrieves user replays by userId
 */
router.get('/:webId/replays', async (req: Request, res: Response, next: Function) => {
    try {
        const userInfos = await db.getUserByWebId(req.params.webId);
        const userReplays = await db.getReplaysByUserRef(userInfos._id);
        res.send(userReplays);
    } catch (err) {
        next(err);
    }
});

export default router;
