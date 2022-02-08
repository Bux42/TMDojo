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
        let { sessionId } = req.cookies;

        // Check if request originated from plugin
        if (!sessionId) {
            sessionId = req.body.sessionId;
        }

        // Check for missing parameters
        if (sessionId === undefined || typeof sessionId !== 'string') {
            res.status(401).send({ message: 'No session secret supplied.' });
            return;
        }

        // Check if the session exists
        const session = await findSessionBySecret(sessionId);
        if (session === null || session === undefined) {
            req.log.warn('logoutRouter: Session not found, deleting session cookie anyway');
            setExpiredSessionCookie(req, res);
            res.status(401).send({ message: 'No session found for this secret.' });
            return;
        }

        req.log.debug('logoutRouter: Deleting session and session cookie');
        await deleteSession(sessionId);
        setExpiredSessionCookie(req, res);

        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

export default router;
