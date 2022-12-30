import { Request, Response } from 'express';
import * as express from 'express';
import { z } from 'zod';
import { exchangeCodeForAccessToken, fetchUserInfo, setSessionCookie } from '../lib/authorize';

import {
    createSession, createUser, getUserByWebId,
} from '../lib/db';
import { asyncErrorHandler } from '../lib/asyncErrorHandler';
import zParseRequest from '../lib/zodParseRequest';
import { HttpError } from '../lib/httpErrors';

const router = express.Router();

/**
 * POST /authorize
 * Authenticates a user using the Trackmania API, returns an encrypted JWT token
 * Body:
 * - code
 * - redirect_uri
 */

const authorizeInputSchema = z.object({
    body: z.object({
        code: z.string(),
        redirect_uri: z.string(),
        clientCode: z.string().optional(),
    }),
});

router.post('/', asyncErrorHandler(async (req: Request, res: Response) => {
    const { body: { code, redirect_uri: redirectUri, clientCode } } = zParseRequest(authorizeInputSchema, req);

    // Exchange access code for access token from Trackmania API
    const accessToken = await exchangeCodeForAccessToken(req, code, redirectUri);
    if (accessToken === undefined || typeof accessToken !== 'string') {
        throw new HttpError(401, 'Failed to get access token from TrackMania API.');
    }

    // Fetch user info using access token
    const userInfo = await fetchUserInfo(req, accessToken);
    if (userInfo === undefined || userInfo.accountId === undefined || userInfo.displayName === undefined) {
        throw new HttpError(500, 'Failed to retrieve user info from TrackMania API.');
    }

    // Create UI session
    // TODO: if clientCode exists (i.e. if this is plugin auth), only create a new UI session if there isn't one yet
    const sessionId = await createSession(req, userInfo);
    if (sessionId === undefined) {
        throw new HttpError(500, 'Failed to create login session.');
    }

    setSessionCookie(req, res, sessionId);

    // if clientCode exists, create a separate plugin session
    // first, check the user doc for the clientCode
    const userDoc = await getUserByWebId(userInfo.accountId);
    if (clientCode && userDoc.clientCode === clientCode) {
        req.log.debug('authorizeRouter: clientCode exists, creating plugin session');
        // remove clientCode from user
        delete userDoc.clientCode;
        await createUser(req, userDoc.webId, userDoc.playerLogin, userDoc.playerName, null);

        // create a new plugin session including the clientCode
        await createSession(req, userInfo, clientCode);
    } else {
        // looks like a different client/the UI initiated this login - don't create a plugin session
        req.log.debug(
            'authorizeRouter: No clientCode/it does not match the OAuth state, no plugin session will be created',
        );
    }

    // send back user info
    res.send({
        accountId: userInfo.accountId,
        displayName: userInfo.displayName,
    });
}));

export default router;
