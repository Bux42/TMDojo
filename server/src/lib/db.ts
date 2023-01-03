import { MongoClient, ObjectId, Db } from 'mongodb';
import { config } from 'dotenv';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';
import { playerLoginFromWebId, UserInfoResponse } from './authorize';
import { logError, logInfo } from './logger';
import { DiscordWebhook } from './discordWebhooks/discordWebhook';

import * as cache from '../cache';

config();

const DB_NAME = 'dojo';

let db: Db;

export type Rejector = (_1: Error) => void;

export const initDB = () => {
    const mongoClient = new MongoClient(process.env.MONGO_URL as string, {
        useUnifiedTopology: true,
    } as any);

    mongoClient.connect((err: any) => {
        if (err) {
            logError('initDB: Could not connect to DB, shutting down');
            process.exit();
        }
        logInfo('initDB: Connected successfully to DB');
        db = mongoClient.db(DB_NAME);
    });
};

export const createUser = (
    req: Request,
    webId: any,
    login: any,
    name: any,
    clientCode: any,
): Promise<{ userID: string }> => new Promise(
    (resolve: (updateInfo: { userID: string }) => void, reject: Rejector) => {
        const users = db.collection('users');
        users
            .find({
                webId,
            })
            .toArray(async (err: any, docs: any) => {
                if (err) {
                    req.log.error(`createUser: Error finding user with webId ${webId}`);
                    reject(err);
                } else if (!docs.length) {
                    const insertedUserData = await users.insertOne({
                        webId,
                        playerLogin: login,
                        playerName: name,
                        clientCode: clientCode || null,
                        createdAt: Date.now(),
                    });

                    req.log.debug(
                        `createUser: Created new user "${name}", doc ID: ${insertedUserData.insertedId.toString()}`,
                    );

                    // Send discord alert for new user
                    DiscordWebhook.sendNewUserAlert(req, name, users);

                    resolve({ userID: insertedUserData.insertedId?.toString() });
                } else {
                    req.log.debug(`createUser: User "${name}" already exists, doc ID: ${docs[0]._id.toString()}`);
                    const updatedUser = {
                        $set: {
                            playerLogin: login,
                            playerName: name,
                            clientCode: clientCode || null,
                        },
                    };
                    await users.updateOne(
                        {
                            webId,
                        },
                        updatedUser,
                    );
                    req.log.debug(`createUser: Updated user "${name}"`);
                    // inserts are explicit, this will always be an existing doc (so passing the known ID is fine)
                    resolve({ userID: docs[0]._id.toString() });
                }
            });
    },
);

export const getMapsStats = async (): Promise<any> => {
    const replays = db.collection('replays');

    const queryPipeline = [
        {
            $group: {
                _id: '$mapRef',
                count: {
                    $sum: 1,
                },
                lastUpdate: { $max: '$date' }, // pass the highest date (i.e. latest replay's timestamp)
            },
        },
        // populate map references to count occurrences
        {
            $lookup: {
                from: 'maps',
                localField: '_id',
                foreignField: '_id',
                as: 'map',
            },
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$map', 0] }, '$$ROOT'] } },
        },
        {
            $project: {
                _id: false,
                mapUId: true,
                mapName: true,
                count: '$count',
                lastUpdate: true,
            },
        },
    ];

    const cursor = replays.aggregate(queryPipeline);
    const data = await cursor.toArray();

    return data;
};

export const getUniqueMapNames = async (
    mapName?: string,
): Promise<any> => {
    const cachedMaps = await cache.getMapsCache();

    if (mapName && mapName !== '') {
        return cachedMaps.filter((mapC: any) => mapC.mapName.toLowerCase().includes(mapName.toLowerCase()));
    }
    return cachedMaps;
};

export const getMapByUId = (mapUId?: string): Promise<any> => new Promise((resolve: Function, reject: Rejector) => {
    const maps = db.collection('maps');
    maps.findOne({ mapUId }, (err: any, map: any) => {
        if (err) {
            return reject(err);
        }
        return resolve(map);
    });
});

export const saveMap = (mapData?: any): Promise<any> => new Promise((resolve: Function, reject: Rejector) => {
    const maps = db.collection('maps');
    maps.insertOne(mapData)
        .then((operation: any) => resolve({ _id: operation.insertedId }))
        .catch((error: Error) => reject(error));
});

// Gets a user by the _id field in the db
export const getUserById = async (id: string) => {
    const users = db.collection('users');
    return users.findOne({
        _id: new ObjectId(id),
    });
};

export const getUserByWebId = (
    webId?: string,
): Promise<any> => new Promise((resolve: Function, reject: Rejector) => {
    const users = db.collection('users');
    users.findOne({ webId }, (err: any, user: any) => {
        if (err) {
            return reject(err);
        }
        return resolve(user);
    });
});

export const getReplaysByUserRef = async (
    userRef: string,
): Promise<any> => {
    const replays = db.collection('replays');

    const pipeline = [
        {
            $match: { userRef: new ObjectId(userRef) },
        },
        {
            $lookup: {
                from: 'maps',
                localField: 'mapRef',
                foreignField: '_id',
                as: 'map',
            },
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$map', 0] }, '$$ROOT'] } },
        },
    ];

    const cursor = replays.aggregate(pipeline);
    const data = await cursor.toArray();
    return { files: data, totalResults: data.length };
};

interface FetchReplaysOptions {
    mapName?: string;
    mapUId?: string;
    playerName?: string;
    maxResults?: number;
}

export const getReplays = async ({
    mapName,
    mapUId,
    maxResults = 1000,
}: FetchReplaysOptions): Promise<any> => {
    const replays = db.collection('replays');

    const pipeline = [];

    if (mapUId) {
        const map = await getMapByUId(mapUId);
        if (map && map._id) {
            pipeline.push({
                $match: {
                    mapRef: map._id,
                },
            });
        }
    }

    // Populate map references
    pipeline.push(...[
        {
            $lookup: {
                from: 'maps',
                localField: 'mapRef',
                foreignField: '_id',
                as: 'map',
            },
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$map', 0] }, '$$ROOT'] } },
        },
    ]);

    const addRegexFilter = (property: string, propertyName: string) => {
        pipeline.push({
            $match: {
                [propertyName]: {
                    $regex: `.*${property}.*`,
                    $options: 'i',
                },
            },
        });
    };

    if (mapName) {
        addRegexFilter(mapName, 'mapName');
    }

    // Populate user references
    pipeline.push(...[
        {
            $lookup: {
                from: 'users',
                localField: 'userRef',
                foreignField: '_id',
                as: 'user',
            },
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$user', 0] }, '$$ROOT'] } },
        },
        {
            $project: {
                clientCode: 0,
                objectPath: 0,
            },
        },
    ]);

    // Add limit
    pipeline.push({
        $limit: maxResults,
    });

    // Remove fields we don't want to return
    pipeline.push({
        $project: {
            userRef: 0, user: 0, mapRef: 0, map: 0, filePath: 0,
        },
    });

    const cursor = replays.aggregate(pipeline);

    const data = await cursor.toArray();

    return {
        files: data,
        totalResults: data.length,
    };
};

export const getReplayById = async (
    replayId?: string,
    populate?: boolean,
): Promise<any> => {
    const replays = db.collection('replays');

    let pipeline = [
        {
            $match: { _id: new ObjectId(replayId) },
        },
    ];

    if (populate) {
        pipeline = pipeline.concat([
            // populate user references
            {
                $lookup: {
                    from: 'users',
                    localField: 'userRef',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$user', 0] }, '$$ROOT'] } },
            },
            // populate map references
            {
                $lookup: {
                    from: 'maps',
                    localField: 'mapRef',
                    foreignField: '_id',
                    as: 'map',
                },
            },
            {
                $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$map', 0] }, '$$ROOT'] } },
            },
            // clean up
            {
                $project: {
                    // don't remove filePath since it's needed in the request
                    userRef: 0, user: 0, mapRef: 0, map: 0, clientCode: 0,
                },
            },
        ] as any[]);
    }

    const cursor = replays.aggregate(pipeline);
    const data = await cursor.toArray();
    return data[0];
};

export const deleteReplayById = async (replayId: any) => {
    const replay = await getReplayById(replayId);

    cache.deleteReplay(replay);

    const replays = db.collection('replays');
    await replays.deleteOne({
        _id: new ObjectId(replayId),
    });
};

export const getReplayByFilePath = (
    filePath?: string,
): Promise<any> => new Promise((resolve: Function, reject: Rejector) => {
    const replays = db.collection('replays');
    replays.findOne({ filePath }, (err: any, replay: any) => {
        if (err) {
            return reject(err);
        }
        return resolve(replay);
    });
});

export const saveReplayMetadata = (
    metadata: any,
): Promise<{ _id: string }> => new Promise((resolve: Function, reject: Rejector) => {
    cache.addReplay(metadata);

    const replays = db.collection('replays');
    replays.insertOne(metadata)
        .then(({ insertedId }: { insertedId: ObjectId }) => resolve({ _id: insertedId.toString() }))
        .catch((error: Error) => reject(error));
});

/**
 * Creates session using a webId.
 * Returns session secret or undefined if something went wrong
 */
export const createSession = async (req: Request, userInfo: UserInfoResponse, clientCode?: any) => {
    // Find user
    const user = await getUserByWebId(userInfo.accountId);
    let userID = user?._id;
    if (!userID) {
        const playerLogin = playerLoginFromWebId(req, userInfo.accountId);

        if (playerLogin === undefined) {
            return undefined;
        }

        if (userInfo.accountId !== undefined && userInfo.displayName !== undefined) {
            const updatedUserInfo = await createUser(
                req, userInfo.accountId, playerLogin, userInfo.displayName, null,
            );
            userID = updatedUserInfo.userID;
        } else {
            return undefined;
        }
    }

    // Create session
    const sessions = db.collection('sessions');
    const sessionId = uuid();
    await sessions.insertOne({
        sessionId,
        clientCode: clientCode || null,
        userRef: userID,
    });

    return sessionId;
};

export const updateSession = async (session: any) => {
    if (!session._id) {
        throw new Error('Session without _id cannot be updated');
    }
    const sessions = db.collection('sessions');
    return sessions.replaceOne({ _id: session._id }, session);
};

export const findSessionBySecret = async (sessionId: string) => {
    const sessions = db.collection('sessions');
    return sessions.findOne({ sessionId });
};

export const findSessionByClientCode = async (clientCode: string) => {
    const sessions = db.collection('sessions');
    return sessions.findOne({ clientCode });
};

export const deleteSession = async (sessionId: string) => {
    const sessions = db.collection('sessions');
    await sessions.deleteOne({
        sessionId,
    });
};

/**
 * If session is valid and can find a user, return user
 * Else, return undefined
 */
export const getUserBySessionId = async (sessionId: string) => {
    // Find session
    const sessions = db.collection('sessions');
    const session = await sessions.findOne({
        sessionId,
    });

    // Return undefined if session is not valid
    if (session === undefined || session === null) {
        return undefined;
    }

    // Find user
    const users = db.collection('users');
    const user = await users.findOne({
        _id: session.userRef,
    });

    // Return undefined if user could not be found
    if (user === undefined || user === null) {
        return undefined;
    }

    return user;
};
