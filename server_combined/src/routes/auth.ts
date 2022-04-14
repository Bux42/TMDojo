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
import { playerLoginFromWebId, fetchPlayerName } from '../lib/authorize';

const router = express.Router();

/**
 * GET /auth
 * Adds user to the database (if they don't exist)
 * Generates a clientCode (and stores it in the user) and returns an OAuth login URL
 * Query params:
 * - webid
 * - sessionId
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
    try {
        // generate clientCode
        const clientCode = `plugin-${uuid()}`;

        // check if there's already a session for the user
        const pluginSession = await db.findSessionBySecret(req.query.sessionId?.toString());
        if (pluginSession) {
            req.log.debug('authRouter: Found session for user, checking webId');
            const pluginUser = await db.getUserByWebId(req.query.webid?.toString());
            if (pluginUser !== undefined
                && pluginSession.userRef.toString() === pluginUser._id.toString()) {
                req.log.debug('authRouter: Session and user match, skipping authURL generation');
                res.send({ authSuccess: true });
                return;
            }
            req.log.warn('authRouter: Session and user do not match, continuing with authURL generation');
        }

        // Check input webId type
        if (typeof req.query.webid !== 'string') {
            req.log.error('authRouter: webid query param is not a string');
            res.status(400).send({ message: 'Invalid WebId query parameter provided, should be of type string.' });
            return;
        }

        // Fetch player name from WebId
        req.log.debug('authRouter: Attempting to fetch player name from webId');
        const playerName = await fetchPlayerName(req, req.query.webid);

        if (playerName === undefined) {
            req.log.error('authRouter: Unable to fetch player name from webId');
            res.status(400)
                // eslint-disable-next-line max-len
                .send({ message: `Unable to fetch player name with the provided WebId: '${req.query.webid}'` });
            return;
        }

        req.log.debug(`authRouter: Fetched player name '${playerName}' from webId '${req.query.webid}'`);

        const playerLogin = playerLoginFromWebId(req, req.query.webid);
        if (playerLogin === undefined) {
            req.log.error('authRouter: Unable to create valid player login from webId');
            res.status(400)
                // eslint-disable-next-line max-len
                .send({ message: `Could not create a valid player login with the provided WebId: '${req.query.webid}'` });
            return;
        }

        // make sure user exists and store clientCode in user's document
        await db.createUser(req,
            req.query.webid,
            playerLogin,
            playerName,
            clientCode);

        // generate OAuth URL
        let authURL = 'https://api.trackmania.com/oauth/authorize';
        authURL += '?response_type=code';
        authURL += `&client_id=${process.env.TM_API_CLIENT_ID}`;
        authURL += `&redirect_uri=${encodeURIComponent(`${process.env.TMDOJO_UI_URL}/auth_redirect`)}`;
        authURL += `&state=${clientCode}`;
        req.log.debug('authRouter: authURL generation complete');

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

        req.log.debug(`authRouter: Searching for session with clientCode "${clientCode}"`);
        const session = await db.findSessionByClientCode(clientCode.toString());
        // TODO: maybe also make the plugin send a user that we can check against - just to be sure it's the same user
        if (session) {
            req.log.debug('authRouter: Found session, sending sessionId and deleting clientCode');
            res.send({ sessionId: session.sessionId });
            // remove clientCode from the session again (so it can't be reused)
            delete session.clientCode;
            await db.updateSession(session);
        } else {
            req.log.error('authRouter: No session found');
            res.status(400).send();
        }
    } catch (err) {
        next(err);
    }
});

export default router;
