import { Request, Response } from 'express';
import * as express from 'express';
import { setExpiredSessionCookie } from '../lib/authorize';

const router = express.Router();

/**
 * POST /me
 * Retrieves user info
 */
router.post('/', async (req: Request, res: Response, next: Function) => {
    try {
        const { user } = req;

        // Get user by session secret
        if (user === undefined) {
            req.log.warn('meRouter: User not found, deleting session cookie');
            setExpiredSessionCookie(req, res);
            res.status(401).send({ message: 'Not logged in.' });
            return;
        }

        // Repond with user info
        res.send({
            accountId: user.webId,
            displayName: user.playerName,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
