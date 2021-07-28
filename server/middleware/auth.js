const { getUserBySessionId } = require('../lib/db');

/**
 * Authentication middleware.
 *
 * Sets req.user to the logged in user
 * Sets req.user to undefined if no user is logged in
 */
const authMiddleware = async (req, res, next) => {
    const { sessionId } = req.cookies;

    // Check for missing parameters
    if (sessionId === undefined || typeof sessionId !== 'string') {
        req.user = undefined;
        next();
        return;
    }

    // Get user by session secret
    const user = await getUserBySessionId(sessionId);
    if (user === undefined || user === null) {
        req.user = undefined;
        next();
        return;
    }

    req.user = user;
    next();
};

module.exports = {
    authMiddleware,
};
