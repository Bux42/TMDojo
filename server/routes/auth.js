const express = require('express');

const router = express.Router();

const db = require('../lib/db');

/**
 * GET /auth
 * Authenticates a user (i.e. stores them in the database for later use)
 * Query params:
 * - webid
 * - login
 * - name
 */
router.get('/', async (req, res, next) => {
    try {
        await db.authenticateUser(req.query.webid, req.query.login, req.query.name);
        res.send('auth done'); // TODO: the plugin expects text for some reason - it should just check the return code
    } catch (err) {
        next(err);
    }
});

module.exports = router;
