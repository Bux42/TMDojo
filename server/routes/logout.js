const express = require('express');
const { deleteSession, findSessionBySecret } = require('../lib/db');

const router = express.Router();

/**
 * POST /logout
 * Logs user out be deleting their session
 * Body:
 * - sessionSecret
 */
router.post('/', async (req, res, next) => {
    try {
        const { sessionSecret } = req.cookies;

        // Check for missing parameters
        if (sessionSecret === undefined || typeof sessionSecret !== 'string') {
            res.status(401).send({ message: 'No session secret supplied.' });
            return; // TODO: check how to properly end response
        }

        // Check if the session exists
        const session = await findSessionBySecret(sessionSecret);
        if (session === null || session === undefined) {
            res.status(401).send({ message: 'No session found for this secret.' });
            return; // TODO: check how to properly end response
        }

        // Send instantly expiring cookie
        res.cookie('sessionSecret', sessionSecret, {
            path: '/',
            httpOnly: true,
            secure: false, // TODO: enable on HTTPS server
            maxAge: -1, // instantly expires
        });

        // Delete session
        await deleteSession(sessionSecret);

        // Repond with user info
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
