import { Request, Response } from 'express';
import * as express from 'express';
import { setExpiredSessionCookie } from '../lib/authorize';
import { deleteSession, findSessionBySecret } from '../lib/db';

const router = express.Router();

/**
 * POST /logout
 * Logs user out be deleting their session
 */
router.post('/', async (req: Request, res: Response, next: Function) => {
    try {
        const { sessionId } = req.cookies;

        // Check for missing parameters
        if (sessionId === undefined || typeof sessionId !== 'string') {
            res.status(401).send({ message: 'No session secret supplied.' });
            return;
        }

        // Check if the session exists
        const session = await findSessionBySecret(sessionId);
        if (session === null || session === undefined) {
            setExpiredSessionCookie(req, res);
            res.status(401).send({ message: 'No session found for this secret.' });
            return;
        }

        await deleteSession(sessionId);

        setExpiredSessionCookie(req, res);

        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

export default router;
