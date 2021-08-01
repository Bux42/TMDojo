const express = require('express');
const { setExpiredSessionCookie } = require('../lib/authorize');

const router = express.Router();

/**
 * POST /me
 * Retrieves user info
 */
router.post('/', async (req, res, next) => {
    try {
        const { user } = req;

        // Get user by session secret
        if (user === undefined) {
            setExpiredSessionCookie(req, res);
            res.status(401).send({ message: 'Not logged in.' });
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
