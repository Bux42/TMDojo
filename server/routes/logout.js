const express = require('express');
const { setExpiredSessionCookie } = require('../lib/authorize');
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
            setExpiredSessionCookie(res);
            res.status(401).send({ message: 'No session found for this secret.' });
            return;
        }

        await deleteSession(sessionId);

        setExpiredSessionCookie(res);

        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
