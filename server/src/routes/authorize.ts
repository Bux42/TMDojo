import { Request, Response } from 'express';
import * as express from 'express';
import { exchangeCodeForAccessToken, fetchUserInfo, setSessionCookie } from '../lib/authorize';

import { createSession, getUserByWebId, saveUser } from '../lib/db';

const router = express.Router();

/**
 * POST /authorize
 * Authenticates a user using the Trackmania API, returns an encrypted JWT token
 * Body:
 * - code
 * - redirect_uri
 */
router.post('/', async (req: Request, res: Response, next: Function) => {
    try {
        // Get code, redirect URI and clientCode from body
        const { code, redirect_uri: redirectUri, clientCode } = req.body;

        // Check for missing parameters
        const missingParams = [];
        if (code === undefined || typeof code !== 'string') {
            missingParams.push('code');
        }
        if (redirectUri === undefined || typeof redirectUri !== 'string') {
            missingParams.push('redirect_uri');
        }
        if (missingParams.length > 0) {
            res.status(400).send({ message: `Body is missing the following params: ${missingParams}` });
            return;
        }

        // Exchange access code for access token from Trackmania API
        const accessToken = await exchangeCodeForAccessToken(req, code, redirectUri);
        if (accessToken === undefined || typeof accessToken !== 'string') {
            res.status(500).send({ message: 'Could not get access token from trackmania API.' });
            return;
        }

        // Fetch user info using access token
        const userInfo = await fetchUserInfo(req, accessToken);
        if (userInfo === undefined || userInfo.account_id === undefined || userInfo.display_name === undefined) {
            res.status(500).send({ message: 'Could not retrieve user info from trackmania API.' });
            return;
        }

        // Create UI session
        // TODO: if clientCode exists (i.e. if this is plugin auth), only create a new UI session if there isn't one yet
        const sessionId = await createSession(req, userInfo);
        if (sessionId === undefined) {
            res.status(500).send({ message: 'Failed to create login session.' });
            return;
        }

        setSessionCookie(req, res, sessionId);

        // if clientCode exists, create a separate plugin session
        // first, check the user doc for the clientCode
        const userDoc = await getUserByWebId(userInfo.account_id);
        if (clientCode && userDoc.clientCode === clientCode) {
            req.log.info('authorizeRouter: clientCode exists, creating plugin session');
            // remove clientCode from user
            delete userDoc.clientCode;
            await saveUser(userDoc);

            // create a new plugin session including the clientCode
            await createSession(req, userInfo, clientCode);
        } else {
            // looks like a different client/the UI initiated this login - don't create a plugin session
            req.log.info(
                'authorizeRouter: No clientCode/it does not match the OAuth state, no plugin session will be created',
            );
        }

        // send back user info
        res.send({
            accountId: userInfo.account_id,
            displayName: userInfo.display_name,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
