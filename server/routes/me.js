const express = require('express');
const { getUserBySessionSecret } = require('../lib/db');

const router = express.Router();

/**
 * POST /me
 * Retrieves user using a session secret
 * Body:
 * - sessionSecret
 */
router.post('/', async (req, res, next) => {
    try {
        // Get code and redirect URI from body
        // TODO: get secret from HttpOnly cookie
        const { sessionSecret } = req.body;

        // Check for missing parameters
        if (sessionSecret === undefined || typeof sessionSecret !== 'string') {
            res.status(401).send({ message: 'No session secret supplied.' });
            return; // TODO: check how to properly end response
        }

        // Get user by session secret
        const user = await getUserBySessionSecret(sessionSecret);
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
