import { Request, Response } from 'express';
import * as express from 'express';
import { setExpiredSessionCookie } from '../lib/authorize';
import { asyncErrorHandler } from '../lib/asyncErrorHandler';
import { HttpError } from '../lib/httpErrors';

const router = express.Router();

/**
 * POST /me
 * Retrieves user info
 */
router.post('/', asyncErrorHandler(async (req: Request, res: Response) => {
    const { user } = req;

    // Get user by session secret
    if (user === undefined) {
        req.log.warn('meRouter: User not found, deleting session cookie');
        setExpiredSessionCookie(req, res);
        throw new HttpError(401, 'Not logged in.');
    }

    // Repond with user info
    res.send({
        accountId: user.webId,
        displayName: user.playerName,
    });
}));

export default router;
