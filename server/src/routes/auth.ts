/** User data model
 * - _id
 * - webId
 * - playerLogin
 * - playerName
 */

import { Request, Response } from 'express';
import * as express from 'express';

import * as db from '../lib/db';

const router = express.Router();

/**
 * GET /auth
 * Authenticates a user (i.e. stores them in the database for later use)
 * Query params:
 * - webid
 * - login
 * - name
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
    try {
        await db.authenticateUser(req.query.webid, req.query.login, req.query.name);
        res.send('auth done'); // TODO: the plugin expects text for some reason - it should just check the return code
    } catch (err) {
        next(err);
    }
});

export default router;
