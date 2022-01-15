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
 * - sessionId
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
    try {
        // generate clientCode
        const clientCode = `plugin-${uuid()}`;

        // check if there's already a session for the user
        const pluginSession = await db.findSessionBySecret(req.query.sessionId.toString());
        if (pluginSession) {
            req.log.info('authRouter: Found session for user, checking webId');
            const pluginUser = await db.getUserByWebId(req.query.webid.toString());
            if (pluginSession.userRef.toString() === pluginUser._id.toString()) {
                req.log.info('authRouter: Session and user match, skipping authURL generation');
                res.send({ authSuccess: true });
                return;
            }
            req.log.info('authRouter: Session and user do not match, continuing with authURL generation');
        }

        // make sure user exists and store clientCode in user's document
        await db.createUser(req.query.webid, req.query.login, req.query.name, clientCode);

        // generate OAuth URL
        let authURL = 'https://api.trackmania.com/oauth/authorize';
        authURL += '?response_type=code';
        authURL += `&client_id=${process.env.TM_API_CLIENT_ID}`;
        authURL += `&redirect_uri=${encodeURIComponent(`${process.env.TMDOJO_UI_URL}/auth_redirect`)}`;
        authURL += `&state=${clientCode}`;
        req.log.info('authRouter: authURL generation complete');

        res.send({ authURL, clientCode });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /pluginSecret
 * Returns session for client (last step in the plugin auth flow)
 * Query params:
 * - clientCode
 */
router.get('/pluginSecret', async (req: Request, res: Response, next: Function) => {
    try {
        const { clientCode } = req.query;

        req.log.info(`authRouter: Searching for session with clientCode "${clientCode}"`);
        const session = await db.findSessionByClientCode(clientCode.toString());
        // TODO: maybe also make the plugin send a user that we can check against - just to be sure it's the same user
        if (session) {
            req.log.info('authRouter: Found session, sending sessionId and deleting clientCode');
            res.send({ sessionId: session.sessionId });
            // remove clientCode from the session again (so it can't be reused)
            delete session.clientCode;
            await db.updateSession(session);
        } else {
            req.log.info('authRouter: No session found');
            res.status(400).send();
        }
    } catch (err) {
        next(err);
    }
});

export default router;
