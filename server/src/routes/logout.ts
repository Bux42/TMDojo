import { Request, Response } from 'express';
import * as express from 'express';
import { z } from 'zod';
import { setExpiredSessionCookie } from '../lib/authorize';
import { deleteSession, findSessionBySecret } from '../lib/db';
import zParseRequest from '../lib/zodParseRequest';
import { asyncErrorHandler } from '../lib/asyncErrorHandler';
import { HttpError } from '../lib/httpErrors';

const router = express.Router();

/**
 * POST /logout
 * Logs user out be deleting their session
 */
const logoutInputSchema = z.object({
    body: z.object({
        sessionId: z.string().optional(),
    }),
    cookies: z.object({
        sessionId: z.string().optional(),
    }),
});

router.post('/', asyncErrorHandler(async (req: Request, res: Response) => {
    const { body, cookies } = zParseRequest(logoutInputSchema, req);

    // Get sessionId from cookie or body
    let sessionId;
    if (cookies.sessionId) {
        req.log.debug('logoutRouter: Using sessionId from cookies');
        sessionId = cookies.sessionId;
    } else if (body.sessionId) {
        req.log.debug('logoutRouter: Using sessionId from body');
        sessionId = body.sessionId;
    } else {
        req.log.warn('logoutRouter: Logout attempt without a sessionId');
        throw new HttpError(401, 'No sessionId provided.');
    }

    // Check if the session exists
    const session = await findSessionBySecret(sessionId);
    if (!session) {
        req.log.warn('logoutRouter: Session not found, deleting session cookie anyway');
        setExpiredSessionCookie(req, res);
        throw new HttpError(401, 'Session not found.');
    }

    // Delete session and set session cookie to instantly expire
    req.log.debug('logoutRouter: Deleting session and session cookie');
    await deleteSession(sessionId);
    setExpiredSessionCookie(req, res);

    res.status(200).end();
}));

export default router;
