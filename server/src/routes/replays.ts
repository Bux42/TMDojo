/** Replay data model
 * - _id
 * - userRef
 * - mapRef
 * - endRaceTime
 * - raceFinished
 * - filePath
 * - date
 */

import { Request, Response } from 'express';
import * as express from 'express';

import * as fs from 'fs';
import * as zlib from 'zlib';
import * as path from 'path';

import * as db from '../lib/db';

const router = express.Router();
/**
 * GET /replays
 * Retrieves filtered replay metadata
 * Query params:
 * - mapName (optional)
 * - playerName (optional)
 * - mapUId (optional)
 * - raceFinished (optional)
 * - orderBy (optional)
 * - maxResults (optional)
 * - endRaceTimeMin (optional) - currently unused
 * - endRaceTimeMax (optional) - currently unused
 * - dateMin (optional) - currently unused
 */
router.get('/', async (req: Request, res: Response, next: Function) => {
    try {
        const replays = await db.getReplays(
            req.query.mapName as string,
            req.query.playerName as string,
            req.query.mapUId as string,
            req.query.raceFinished as string,
            req.query.orderBy as string,
            req.query.maxResults as string,
        );
        res.send(replays);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /replays/:replayId
 * Retrieves a replay file by the replay's id (defined as the MongoDB document's "_id" property)
 * Query params:
 * - download (optional)
 * - fileName (optional)
 */
router.get('/:replayId', async (req: Request, res: Response, next: Function) => {
    try {
        const replay = await db.getReplayById(req.params.replayId as string);
        const filePath = path.resolve(`${__dirname}/../../${replay.filePath}`);
        if (fs.existsSync(filePath)) {
            if (req.query.download === 'true') {
                res.download(filePath, req.query.fileName as string || req.params.replayId as string);
            } else {
                const file = fs.readFileSync(filePath);
                const unzipped = zlib.unzipSync(file);
                res.send(unzipped);
            }
        } else {
            res.status(404).send();
        }
    } catch (err) {
        next(err);
    }
});

/**
 * POST /replays
 * Stores replay data (from the request body)
 * Query params:
 * - authorName
 * - mapName
 * - mapUId
 * - endRaceTime
 * - raceFinished
 * - playerName
 * - playerLogin
 * - webId
 */
// eslint-disable-next-line consistent-return
router.post('/', (req: Request, res: Response, next: Function): any => {
    const paramNames = [
        'authorName', 'mapName', 'mapUId', 'endRaceTime', 'raceFinished', 'playerName', 'playerLogin', 'webId',
    ];

    // make sure all required parameters are present
    let requestValid = true;
    paramNames.forEach((paramName) => {
        if (!Object.prototype.hasOwnProperty.call(req.query, paramName)) {
            requestValid = false;
        }
    });
    if (!requestValid) {
        return res.status(400).send({ message: 'Request is missing one or more parameters' });
    }

    const secureMapName = decodeURIComponent(req.query.mapName as string);

    // prepare directories
    if (!fs.existsSync(`maps/${req.query.authorName}`)) {
        fs.mkdirSync(`maps/${req.query.authorName}`);
    }
    if (!fs.existsSync(`maps/${req.query.authorName}/${secureMapName}`)) {
        fs.mkdirSync(`maps/${req.query.authorName}/${secureMapName}`);
    }

    let completeData = '';
    req.on('data', (data: string | Buffer) => {
        completeData += data;
    });

    req.on('end', () => {
        const buff = Buffer.from(completeData, 'base64');
        const fileName = `${req.query.endRaceTime}_${req.query.playerName}_${Date.now()}`;
        const filePath = `maps/${req.query.authorName}/${secureMapName}/${fileName}.gz`;

        fs.writeFile(filePath, zlib.gzipSync(buff), async (writeErr: Error) => {
            if (writeErr) {
                return next(writeErr);
            }

            console.log('POST /replays: The file was saved at', filePath);

            try {
                // check if map already exists
                let map = await db.getMapByUId(req.query.mapUId as string);
                if (!map) {
                    map = await db.saveMap({
                        mapName: secureMapName,
                        mapUId: req.query.mapUId,
                        authorName: req.query.authorName,
                    });
                }

                // check if user already exists
                let user = await db.getUserByWebId(req.query.webId as string);
                if (!user) {
                    user = await db.saveUser({
                        playerName: req.query.playerName,
                        playerLogin: req.query.playerLogin,
                        webId: req.query.webId,
                    });
                }

                const metadata = {
                    // reference map and user docs
                    mapRef: map._id,
                    userRef: user._id,
                    filePath,
                    date: Date.now(),
                    raceFinished: parseInt(req.query.raceFinished as string, 10),
                    endRaceTime: parseInt(req.query.endRaceTime as string, 10),
                };
                await db.saveReplayMetadata(metadata);
                return res.send();
            } catch (dbErr) {
                return next(dbErr);
            }
        });
    });

    req.on('error', (err) => next(err));
});

export default router;
