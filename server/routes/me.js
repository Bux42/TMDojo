const express = require('express');

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
