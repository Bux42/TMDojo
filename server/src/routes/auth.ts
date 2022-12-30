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
import { z } from 'zod';

import * as db from '../lib/db';
import { playerLoginFromWebId, fetchPlayerName } from '../lib/authorize';
import { asyncErrorHandler } from '../lib/asyncErrorHandler';
import zParseRequest from '../lib/zodParseRequest';
import { HttpError } from '../lib/httpErrors';

const router = express.Router();

/**
 * GET /auth
 * Adds user to the database (if they don't exist)
 * Generates a clientCode (and stores it in the user) and returns an OAuth login URL
 * Query params:
 * - webid
 * - sessionId
 */
const authInputSchema = z.object({
    query: z.object({
        webid: z.string().uuid(),
        sessionId: z.string().optional(),
    }),
});

router.get('/', asyncErrorHandler(async (req: Request, res: Response) => {
    const { query: { webid, sessionId } } = zParseRequest(authInputSchema, req);

    // check if there's already a session for the user
    if (sessionId) {
        const pluginSession = await db.findSessionBySecret(sessionId?.toString());
        if (pluginSession) {
            req.log.debug('authRouter: Found session for user, checking webId');
            const pluginUser = await db.getUserByWebId(webid.toString());
            if (pluginUser !== null
                        && pluginSession.userRef.toString() === pluginUser._id.toString()) {
                req.log.debug('authRouter: Session and user match, skipping authURL generation');
                res.send({ authSuccess: true });
                return;
            }
            req.log.warn('authRouter: Session and user do not match, continuing with authURL generation');
        }
    }

    // Fetch player name from WebId
    req.log.debug('authRouter: Attempting to fetch player name from webId');
    const playerName = await fetchPlayerName(req, webid);

    if (playerName === undefined) {
        req.log.error('authRouter: Unable to fetch player name from webId');
        throw new HttpError(400, `Unable to fetch player name with the provided webid: '${webid}'`);
    }

    req.log.debug(`authRouter: Fetched player name '${playerName}' from webId '${webid}'`);

    const playerLogin = playerLoginFromWebId(req, webid);
    if (playerLogin === undefined) {
        req.log.error('authRouter: Unable to create valid player login from webId');
        throw new HttpError(400, `Unable to create a valid player login with the provided webid: '${webid}'`);
    }

    // Make sure user exists and store clientCode in user's document
    const clientCode = `plugin-${uuid()}`;
    await db.createUser(req,
        webid,
        playerLogin,
        playerName,
        clientCode);

    // Generate OAuth URL
    let authURL = 'https://api.trackmania.com/oauth/authorize';
    authURL += '?response_type=code';
    authURL += `&client_id=${process.env.TM_API_CLIENT_ID}`;
    authURL += `&redirect_uri=${encodeURIComponent(`${process.env.TMDOJO_UI_URL}/auth_redirect`)}`;
    authURL += `&state=${clientCode}`;
    req.log.debug('authRouter: authURL generation complete');

    res.send({ authURL, clientCode });
}));

/**
 * GET /pluginSecret
 * Returns session for client (last step in the plugin auth flow)
 * Query params:
 * - clientCode
 */
const pluginSecretInputSchema = z.object({
    query: z.object({
        clientCode: z.string(),
    }),
});

router.get('/pluginSecret', asyncErrorHandler(async (req: Request, res: Response) => {
    const { query: { clientCode } } = zParseRequest(pluginSecretInputSchema, req);

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
}));

export default router;
