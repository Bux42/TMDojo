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
        const userInfos = await db.getUserByWebId(req.params.webId);
        if (!userInfos) {
            req.log.error(`usersRouter: User with webId "${req.params.webId}" not found`);
            res.status(404).send();
            return;
        }
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
        const showPrivate = req.user && req.user.webId === req.params.webId;
        const userReplays = await db.getReplaysByUserRef(userInfos._id, showPrivate);
        res.send(userReplays);
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /users/:webId/private-replays
 * Updates the current user's privateReplays setting
 */
router.put('/:webId/private-replays', async (req: Request, res: Response, next: Function) => {
    try {
        if (!req.user || req.user.webId !== req.params.webId) {
            req.log.error('usersRouter: Unauthenticated privateReplays update attempt');
            res.status(401).send({ message: 'Authentication required.' });
            return;
        }

        const { privateReplays } = req.body;
        if (typeof privateReplays !== 'boolean') {
            req.log.error('usersRouter: Invalid privateReplays payload, expected boolean');
            res.status(400).send({ message: 'privateReplays must be a boolean.' });
            return;
        }

        const updateResult = await db.setUserPrivateReplays(req.params.webId, privateReplays);
        if (updateResult.matchedCount === 0) {
            req.log.error(`usersRouter: User with webId "${req.params.webId}" not found`);
            res.status(404).send({ message: 'User not found.' });
            return;
        }

        res.send({ privateReplays });
    } catch (err) {
        next(err);
    }
});

export default router;
