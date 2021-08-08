import { Request, Response } from 'express';
import { getUserBySessionId } from '../lib/db';

/**
 * Authentication middleware.
 *
 * Sets req.user to the logged in user
 * Sets req.user to undefined if no user is logged in
 */
const authMiddleware = async (req: Request, res: Response, next: Function) => {
    const { sessionId } = req.cookies;

    // Check for missing parameters
    if (sessionId === undefined || typeof sessionId !== 'string') {
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
