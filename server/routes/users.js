const express = require('express');

const router = express.Router();

const db = require('../lib/db');

router.get('/', async (req, res, next) => {
    try {
        res.send({ text: 'yep' });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /users/:webId/info
 * Retrieves user infos by webId
 */
router.get('/:webId/info', async (req, res, next) => {
    try {
        const userInfos = await db.getUserByWebId(req.params.webId);
        console.log('userInfos', userInfos);
        res.send(userInfos);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /users/:userId/replays
 * Retrieves user replays by userId
 */
router.get('/:userId/replays', async (req, res, next) => {
    try {
        const userReplays = await db.getReplaysByUserId(req.params.userId);
        res.send(userReplays);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
