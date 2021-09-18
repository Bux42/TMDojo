/** User data model
 * - _id
 * - webId
 * - playerLogin
 * - playerName
 * - clientCode (optional, only used during plugin auth flow)
 */

import { Request, Response } from 'express';
import * as express from 'express';
import { v4 as uuid } from 'uuid';

import * as db from '../lib/db';

const router = express.Router();

/**
 * GET /auth
 * Adds user to the database (if they don't exist)
 * Generates a clientCode (and stores it in the user) and returns an OAuth login URL
 * Query params:
 * - webid
 * - login
 * - name
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
    try {
        // generate clientCode
        const clientCode = uuid();

        // check if sessionId sent by plugin checks out wih user infos

        const pluginSession = await db.findSessionBySecret(req.query.sessionId.toString());

        if (pluginSession) {
            const pluginUser = await db.getUserByWebId(req.query.webid.toString());
            if (pluginSession.userRef.toString() === pluginUser._id.toString()) {
                res.send({ authSuccess: true });
                return;
            }
        }

        // make sure user exists and store clientCode in user's document
        await db.authenticateUser(req.query.webid, req.query.login, req.query.name, clientCode);

        // generate OAuth URL
        let authURL = 'https://api.trackmania.com/oauth/authorize';
        authURL += '?response_type=code';
        authURL += `&client_id=${process.env.TM_API_CLIENT_ID}`;
        authURL += `&redirect_uri=${encodeURIComponent(`${process.env.TMDOJO_UI_URL}/auth_redirect_plugin`)}`;
        authURL += `&state=${clientCode}`;

        res.send({ authURL, clientCode });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /auth
 * Returns session for client (last step in the plugin auth flow)
 * Query params:
 * - clientCode
 */
router.get('/pluginSecret', async (req: Request, res: Response, next: Function) => {
    try {
        const { clientCode } = req.query;

        const session = await db.findSessionByClientCode(clientCode.toString());
        // TODO: maybe also make the plugin send a user that we can check against - just to be sure it's the same user
        if (session) {
            res.send({ sessionId: session.sessionId });
            // remove clientCode from the session again (so it can't be reused)
            delete session.clientCode;
            await db.updateSession(session);
        } else {
            res.status(400).send();
        }
    } catch (err) {
        next(err);
    }
});

export default router;
