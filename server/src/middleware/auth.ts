import { Request, Response } from 'express';
import { getUserBySessionId } from '../lib/db';

/**
 * Authentication middleware.
 *
 * Sets req.user to the logged in user
 * Sets req.user to undefined if no user is logged in
 */
const authMiddleware = async (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers.authorization;

    let sessionId;
    if (req.cookies && req.cookies.sessionId) { // UI uses cookies (sessionId)
        sessionId = req.cookies.sessionId;
    } else if (authHeader && authHeader.startsWith('dojo ')) { // plugin uses auth header ("dojo <sessionId>")
        sessionId = authHeader.substring(5);
    }

    if (!sessionId || typeof sessionId !== 'string') {
        // no sessionId and no auth header, so no user
        req.user = undefined;
        return next();
    }

    // Get user by session secret
    const user = await getUserBySessionId(sessionId);
    if (user === undefined || user === null) {
        req.user = undefined;
        return next();
    }

    req.user = user;
    return next();
};

export default authMiddleware;
