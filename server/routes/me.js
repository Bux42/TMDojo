const express = require('express');
const { getUserBySessionId } = require('../lib/db');

const router = express.Router();

/**
 * POST /me
 * Retrieves user info
 */
router.post('/', async (req, res, next) => {
    try {
        const { sessionId } = req.cookies;

        // Check for missing parameters
        if (sessionId === undefined || typeof sessionId !== 'string') {
            res.status(401).send({ message: 'No session secret supplied.' });
            return; // TODO: check how to properly end response
        }

        // Get user by session secret
        const user = await getUserBySessionId(sessionId);
        if (user === undefined || user === null) {
            res.status(401).send({ message: 'No valid session found for session secret.' });
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

module.exports = router;
