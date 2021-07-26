const express = require('express');
const { deleteSession } = require('../lib/db');

const router = express.Router();

/**
 * POST /logout
 * Logs user out be deleting their session
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

        // Delete session
        await deleteSession(sessionSecret);

        // Repond with user info
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
