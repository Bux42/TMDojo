import { Request, Response } from 'express';
import { getUserBySessionId } from '../lib/db';
import { logDebug, logWarn } from '../lib/logger';

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
        logDebug('authMiddleware: Using sessionId cookie for authentication');
        sessionId = req.cookies.sessionId;
    } else if (authHeader && authHeader.startsWith('dojo ')) { // plugin uses auth header ("dojo <sessionId>")
        logDebug('authMiddleware: Using Authorization header for authentication');
        sessionId = authHeader.substring(5);
    }

    if (!sessionId || typeof sessionId !== 'string') {
        logDebug('authMiddleware: No sessionId found, continuing without authentication');
        // no sessionId and no auth header, so no user
        req.user = undefined;
        return next();
    }

    // Get user by session secret
    const user = await getUserBySessionId(sessionId);
    if (user === undefined || user === null) {
        logWarn(`authMiddleware: No user with sessionId ${sessionId} found, continuing without authentication`);
        req.user = undefined;
        return next();
    }

    logDebug(`authMiddleware: User ${user.playerName}/${user.webId} authenticated`);
    req.user = user;
    return next();
};

export default authMiddleware;
