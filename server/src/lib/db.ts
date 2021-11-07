import { MongoClient, ObjectId, Db } from 'mongodb';
import { config } from 'dotenv';
import { v4 as uuid } from 'uuid';
import { playerLoginFromWebId } from './authorize';

config();

const DB_NAME = 'dojo';

let db: Db = null;

export type Rejector = (_1: Error) => void;

export const initDB = () => {
    const mongoClient = new MongoClient(process.env.MONGO_URL, {
        useUnifiedTopology: true,
    } as any);

    mongoClient.connect((err: Error) => {
        if (err) {
            console.error('initDB: Could not connect to DB, shutting down');
            process.exit();
        }
        console.log('initDB: Connected successfully to DB');
        db = mongoClient.db(DB_NAME);
    });
};

export const createUser = (
    webId: any,
    login: any,
    name: any,
    clientCode: any,
): Promise<void> => new Promise((resolve: () => void, reject: Rejector) => {
    const users = db.collection('users');
    users
        .find({
            webId,
        })
        .toArray((err: Error, docs: any) => {
            if (err) {
                reject(err);
            } else if (!docs.length) {
                users.insertOne({
                    webId,
                    playerLogin: login,
                    playerName: name,
                    last_active: Date.now(),
                    clientCode: clientCode || null,
                });
                resolve();
            } else {
                const updatedUser = {
                    $set: {
                        playerLogin: login,
                        playerName: name,
                        last_active: Date.now(),
                        clientCode: clientCode || null,
                    },
                };
                users.updateOne(
                    {
                        webId,
                    },
                    updatedUser,
                );
                resolve();
            }
        });
});

export const getUniqueMapNames = (
    mapName ?: string,
): Promise<any> => new Promise((resolve: Function, reject: Rejector) => {
    const replays = db.collection('replays');
    const queryPipeline = [
        // populate map references to count occurrences
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
        {
            $group: {
                _id: '$mapUId',
                mapName: { $first: '$mapName' }, // pass the first instance of mapUId (since it'll always be the same)
                count: {
                    $sum: 1,
                },
                lastUpdate: { $max: '$date' }, // pass the highest date (i.e. latest replay's timestamp)
            },
        },
        {
            $project: {
                _id: false,
                mapUId: '$_id',
                mapName: true,
                count: '$count',
                lastUpdate: true,
            },
        },
    ];

    // only filter by name if there's valid input
    if (mapName && mapName !== '') {
        queryPipeline.push({
            $match: {
                mapName: { $regex: `.*${mapName}.*`, $options: 'i' },
            },
        } as any);
    }

    try {
        const cursor = replays.aggregate(queryPipeline);
        try {
            const data = cursor.toArray();
            return resolve(data);
        } catch (arrayErr) {
            return reject(arrayErr);
        }
    } catch (aggregateErr) {
        return reject(aggregateErr);
    }
});

export const getMapByUId = (mapUId ?: string): Promise<any> => new Promise((resolve: Function, reject: Rejector) => {
    const maps = db.collection('maps');
    maps.findOne({ mapUId }, (err: Error, map: any) => {
        if (err) {
            return reject(err);
        }
        return resolve(map);
    });
});

export const saveMap = (mapData ?: any): Promise<any> => new Promise((resolve: Function, reject: Rejector) => {
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
    webId ?: string,
): Promise<any> => new Promise((resolve: Function, reject: Rejector) => {
    const users = db.collection('users');
    users.findOne({ webId }, (err: Error, user: any) => {
        if (err) {
            return reject(err);
        }
        return resolve(user);
    });
});

export const saveUser = (
    userData: any,
): Promise<{_id: string}> => new Promise((resolve: Function, reject: Rejector) => {
    const users = db.collection('users');
    // if _id is not defined, the upsert option will ensure a new document is created
    users.replaceOne({ _id: userData._id }, userData, { upsert: true })
        .then(({ insertedId }: {insertedId: string}) => resolve({ _id: insertedId }))
        .catch((error: Error) => reject(error));
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

export const getReplays = async (
    mapName ?: string,
    playerName ?: string,
    mapUId ?: string,
    raceFinished ?: string,
    orderBy ?: string,
    maxResults: string = '1000',
): Promise<any> => {
    const replays = db.collection('replays');

    const pipeline = [
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
    ];

    const addRegexFilter = (property ?: string, propertyName ?: string) => {
        if (property) {
            pipeline.push({
                $match: {
                    [propertyName]: {
                        $regex: `.*${property}.*`,
                        $options: 'i',
                    },
                },
            } as any);
        }
    };

    // apply filters
    addRegexFilter(mapName, 'mapName');
    addRegexFilter(playerName, 'playerName');
    addRegexFilter(mapUId, 'mapUId');

    if (raceFinished && raceFinished !== '-1') {
        pipeline.push({
            $match: {
                raceFinished: parseInt(raceFinished, 10),
            },
        } as any);
    }

    if (orderBy && orderBy !== 'None') {
        const order: {endRaceTime?: number, date?: number} = {};
        if (orderBy === 'Time Desc') {
            order.endRaceTime = -1;
        } else if (orderBy === 'Time Asc') {
            order.endRaceTime = 1;
        } else if (orderBy === 'Date Desc') {
            order.date = -1;
        } else if (orderBy === 'Date Asc') {
            order.date = 1;
        }
        pipeline.push({
            $sort: order,
        } as any);
    }

    // add limit and clean up results
    pipeline.push({
        $limit: parseInt(maxResults, 10),
    } as any);
    pipeline.push({
        $project: {
            userRef: 0, user: 0, mapRef: 0, map: 0, filePath: 0,
        },
    } as any);

    const cursor = replays.aggregate(pipeline);
    const data = await cursor.toArray();
    return { files: data, totalResults: data.length };
};

export const getReplayById = async (
    replayId ?: string,
    populate ?: boolean,
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
                    userRef: 0, user: 0, mapRef: 0, map: 0,
                },
            },
        ] as any[]);
    }

    const cursor = replays.aggregate(pipeline);
    const data = await cursor.toArray();
    return data[0];
};

export const deleteReplayById = async (replayId: any) => {
    const replays = db.collection('replays');
    await replays.deleteOne({
        _id: new ObjectId(replayId),
    });
};

export const getReplayByFilePath = (
    filePath ?: string,
): Promise<any> => new Promise((resolve: Function, reject: Rejector) => {
    const replays = db.collection('replays');
    replays.findOne({ filePath }, (err: Error, replay: any) => {
        if (err) {
            return reject(err);
        }
        return resolve(replay);
    });
});

export const saveReplayMetadata = (
    metadata: any,
): Promise<{_id: string}> => new Promise((resolve: Function, reject: Rejector) => {
    const replays = db.collection('replays');
    replays.insertOne(metadata)
        .then(({ insertedId }: {insertedId: ObjectId}) => resolve({ _id: insertedId }))
        .catch((error: Error) => reject(error));
});

/**
 * Creates session using a webId.
 * Returns session secret or undefined if something went wrong
 */
export const createSession = async (userInfo: any, clientCode?: any) => {
    // Find user
    let user = await getUserByWebId(userInfo.account_id);
    if (user === undefined || user === null) {
        const playerLogin = playerLoginFromWebId(userInfo.account_id);

        if (playerLogin === undefined) {
            console.log(`Failed to create session, generated playerLogin is not valid: ${playerLogin}`);
            return undefined;
        }

        if (userInfo.account_id !== undefined && userInfo.display_name !== undefined) {
            user = await saveUser({
                webId: userInfo.account_id,
                playerLogin,
                playerName: userInfo.display_name,
            });
        } else {
            console.log(`Could not create user for webId: ${userInfo.account_id}`);
            return undefined;
        }
    }

    // Create session
    const sessions = db.collection('sessions');
    const sessionId = uuid();
    await sessions.insertOne({
        sessionId,
        clientCode: clientCode || null,
        userRef: user._id,
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
