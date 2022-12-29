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
import { z } from 'zod';

import * as db from '../lib/db';
import zParseRequest from '../lib/zodParseRequest';
import { wrap } from '../lib/asyncErrorHandler';

const router = express.Router();

/**
 * GET /users/:webId/info
 * Retrieves user infos by webId
 */
const userInfoInputSchema = z.object({
    params: z.object({
        webId: z.string().uuid(),
    }),
});

router.get('/:webId/info', wrap(async (req: Request, res: Response) => {
    const { params: { webId } } = zParseRequest(userInfoInputSchema, req);

    const userInfos = await db.getUserByWebId(webId);
    if (!userInfos) {
        req.log.error(`usersRouter: User with webId "${webId}" not found`);
        res.status(404).send();
        return;
    }
    res.send(userInfos);
}));

/**
 * GET /users/:userId/replays
 * Retrieves user replays by userId
 */
const userReplaysInputSchema = z.object({
    params: z.object({
        webId: z.string().uuid(),
    }),
});

router.get('/:webId/replays', wrap(async (req: Request, res: Response) => {
    const { params: { webId } } = zParseRequest(userReplaysInputSchema, req);

    const userInfos = await db.getUserByWebId(webId);
    const userReplays = await db.getReplaysByUserRef(userInfos._id);
    res.send(userReplays);
}));

export default router;
