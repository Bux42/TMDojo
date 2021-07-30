const express = require('express');
const { deleteSession, findSessionBySecret } = require('../lib/db');

const router = express.Router();

/**
 * POST /logout
 * Logs user out be deleting their session
 */
router.post('/', async (req, res, next) => {
    try {
        const { sessionId } = req.cookies;

        // Check for missing parameters
        if (sessionId === undefined || typeof sessionId !== 'string') {
            res.status(401).send({ message: 'No session secret supplied.' });
            return;
        }

        // Check if the session exists
        const session = await findSessionBySecret(sessionId);
        if (session === null || session === undefined) {
            res.status(401).send({ message: 'No session found for this secret.' });
            return;
        }

        // Send instantly expiring cookie
        res.cookie('sessionId', sessionId, {
            path: '/',
            secure: false, // TODO: enable on HTTPS server
            maxAge: -1, // instantly expires
            domain: process.env.NODE_ENV === 'prod' ? 'tmdojo.com' : 'localhost',
        });

        // Delete session
        await deleteSession(sessionId);

        // Repond with user info
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
