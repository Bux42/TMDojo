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
 * - secret
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
    try {
        await db.authenticateUser(req.query.webid, req.query.login, req.query.name);
        const user = await db.getUserByWebId(req.query.webid.toString());
        console.log('AUTH: ', user);

        if (req.query.secret) {
            console.log('has secret');
            if (req.query.secret === user.secret) {
                res.send('Authorized');
            } else {
                res.send('Unauthorized');
            }
        } else {
            console.log('no secret');
            res.send('Unauthorized');
        }
    } catch (err) {
        next(err);
    }
});

/**
 * GET /auth/plugin
 * Authenticates user plugin
 * Query params:
 * - webid
 * - login
 * - name
 */

router.get('/plugin', async (req: Request, res: Response, next: Function) => {
    try {
        await db.authenticateUser(req.query.webid, req.query.login, req.query.name);
        const user = await db.getUserByWebId(req.query.webid.toString());
        const secret = await db.createPluginSecret(req.query.webid.toString());
        console.log('PLUGIN: ', user, 'SECRET: ', secret);
        res.send(`http://localhost:4200/?secret=${secret}`);
    } catch (err) {
        next(err);
    }
});

export default router;
