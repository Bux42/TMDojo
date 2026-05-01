import { MongoClient, ObjectId, Db } from 'mongodb';
import { config } from 'dotenv';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';
import { playerLoginFromWebId, UserInfoResponse } from './authorize';
import { logInfo } from './logger';
import { DiscordWebhook } from './discordWebhooks/discordWebhook';

config();

const DB_NAME = 'dojo';

let db: Db | null = null;

const getDb = (): Db => {
    if (!db) {
        throw new Error('Database connection has not been initialized');
    }
    return db;
};

export type Rejector = (_1: Error) => void;

export type MapSortBy = 'map_name' | 'last_updated' | 'replay_count';
export type SortOrder = 'desc' | 'asc';

export const initDB = async () => {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
        throw new Error('MONGO_URL is not configured');
    }

    const mongoClient = new MongoClient(mongoUrl, {
        useUnifiedTopology: true,
    } as any);

    await mongoClient.connect();
    logInfo('initDB: Connected successfully to DB');
    db = mongoClient.db(DB_NAME);
    await syncMapReplayStats();
};

export const syncMapReplayStats = async (): Promise<void> => {
    const database = getDb();
    const maps = database.collection('maps');
    const replays = database.collection('replays');

    logInfo('syncMapReplayStats: Rebuilding cached map replay stats');

    const replayStats = await replays.aggregate([
        {
            $match: {
                private: { $ne: true },
            },
        },
        {
            $group: {
                _id: '$mapRef',
                replayCount: { $sum: 1 },
                lastReplayAt: { $max: '$date' },
            },
        },
    ]).toArray();

    await maps.updateMany({}, {
        $set: {
            replayCount: 0,
            lastReplayAt: null,
        },
    });

    if (replayStats.length) {
        await maps.bulkWrite(replayStats.map((stat) => ({
            updateOne: {
                filter: { _id: stat._id },
                update: {
                    $set: {
                        replayCount: stat.replayCount,
                        lastReplayAt: stat.lastReplayAt,
                    },
                },
            },
        })));
    }

    logInfo(`syncMapReplayStats: Updated ${replayStats.length} maps`);
};

export const createUser = async (
    req: Request,
    webId: any,
    login: any,
    name: any,
    clientCode: any,
): Promise<{ userID: string }> => {
    try {
        const users = getDb().collection('users');
        const docs = await users.find({ webId }).toArray();
        if (!docs.length) {
            const insertedUserData = await users.insertOne({
                webId,
                playerLogin: login,
                playerName: name,
                privateReplays: false,
                clientCode: clientCode || null,
                createdAt: Date.now(),
            });

            req.log.debug(
                `createUser: Created new user "${name}", doc ID: ${insertedUserData.insertedId.toString()}`,
            );

            DiscordWebhook.sendNewUserAlert(req, name, users);
            return { userID: insertedUserData.insertedId.toString() };
        }

        req.log.debug(`createUser: User "${name}" already exists, doc ID: ${docs[0]._id.toString()}`);
        await users.updateOne(
            { webId },
            {
                $set: {
                    playerLogin: login,
                    playerName: name,
                    clientCode: clientCode || null,
                },
            },
        );
        req.log.debug(`createUser: Updated user "${name}"`);
        return { userID: docs[0]._id.toString() };
    } catch (error) {
        req.log.error(`createUser: Error finding user with webId ${webId}`);
        throw error instanceof Error ? error : new Error(String(error));
    }
};

export const incrementMapReplayStats = async (mapRef: ObjectId, replayDate: number): Promise<void> => {
    const maps = getDb().collection('maps');
    await maps.updateOne(
        { _id: mapRef },
        {
            $inc: { replayCount: 1 },
            $max: { lastReplayAt: replayDate },
        },
    );
};

export const refreshMapReplayStats = async (mapRef: ObjectId): Promise<void> => {
    const database = getDb();
    const maps = database.collection('maps');
    const replays = database.collection('replays');

    const [stats] = await replays.aggregate([
        {
            $match: {
                mapRef,
                private: { $ne: true },
            },
        },
        {
            $group: {
                _id: '$mapRef',
                replayCount: { $sum: 1 },
                lastReplayAt: { $max: '$date' },
            },
        },
    ]).toArray();

    await maps.updateOne(
        { _id: mapRef },
        {
            $set: {
                replayCount: stats?.replayCount || 0,
                lastReplayAt: stats?.lastReplayAt || null,
            },
        },
    );
};

export const getMapsStats = async (): Promise<any> => {
    const maps = getDb().collection('maps');

    const queryPipeline = [
        {
            $match: {
                replayCount: { $gt: 0 },
            },
        },
        {
            $project: {
                _id: false,
                mapUId: true,
                mapName: true,
                count: '$replayCount',
                lastUpdate: '$lastReplayAt',
            },
        },
    ];

    const cursor = maps.aggregate(queryPipeline);
    const data = await cursor.toArray();

    return data;
};

export const getPaginatedMaps = async (
    mapName?: string,
    offset: number = 0,
    limit: number = 50,
    sortBy: MapSortBy = 'last_updated',
    sortOrder: SortOrder = 'desc',
): Promise<{ maps: any[] }> => {
    const maps = getDb().collection('maps');
    const trimmedMapName = mapName?.trim();
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    let populatedSortStage: any = { $sort: { lastUpdate: sortDirection } };
    if (sortBy === 'map_name') {
        populatedSortStage = { $sort: { mapName: sortDirection } };
    } else if (sortBy === 'replay_count') {
        populatedSortStage = { $sort: { count: sortDirection } };
    }

    const matchStage: any = {
        replayCount: { $gt: 0 },
    };
    if (trimmedMapName) {
        matchStage.mapName = { $regex: `.*${trimmedMapName}.*`, $options: 'i' };
    }

    const pipeline: any[] = [
        {
            $match: matchStage,
        },
        {
            $project: {
                _id: false,
                mapUId: true,
                mapName: true,
                count: '$replayCount',
                lastUpdate: '$lastReplayAt',
            },
        },
        populatedSortStage,
        {
            $skip: offset,
        },
        {
            $limit: limit,
        },
    ];

    const cursor = maps.aggregate(pipeline);
    const paginatedMaps = await cursor.toArray();
    return { maps: paginatedMaps };
};

export const getTotalMapCount = async (mapName?: string): Promise<number> => {
    const maps = getDb().collection('maps');

    const filter: any = {
        replayCount: { $gt: 0 },
    };
    if (mapName && mapName !== '') {
        filter.mapName = { $regex: `.*${mapName}.*`, $options: 'i' };
    }

    const [result] = await maps.aggregate([
        { $match: filter },
        { $count: 'total' },
    ]).toArray();

    return result?.total || 0;
};

export const getTotalReplayCount = async (): Promise<number> => {
    const replays = getDb().collection('replays');
    const count = await replays.countDocuments({ private: { $ne: true } });
    return count;
};

export const getMapByUId = async (mapUId?: string): Promise<any> => {
    const maps = getDb().collection('maps');
    return maps.findOne({ mapUId });
};

export const saveMap = (mapData?: any): Promise<any> => new Promise((resolve: Function, reject: Rejector) => {
    const maps = getDb().collection('maps');
    maps.insertOne({
        replayCount: 0,
        lastReplayAt: null,
        ...mapData,
    })
        .then((operation: any) => resolve({ _id: operation.insertedId }))
        .catch((error: Error) => reject(error));
});

// Gets a user by the _id field in the db
export const getUserById = async (id: string) => {
    const users = getDb().collection('users');
    return users.findOne({
        _id: new ObjectId(id),
    });
};

export const getUserByWebId = async (webId?: string): Promise<any> => {
    const users = getDb().collection('users');
    return users.findOne({ webId });
};

export const getReplaysByUserRef = async (
    userRef: string,
    showPrivate: boolean = false,
): Promise<any> => {
    const replays = getDb().collection('replays');

    let matchCondition: any = { userRef: new ObjectId(userRef) };

    if (!showPrivate) {
        matchCondition = { ...matchCondition, private: { $ne: !showPrivate } };
    }

    const pipeline = [
        {
            $match: matchCondition,
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

export const setUserPrivateReplays = async (
    webId: string,
    privateReplays: boolean,
) => {
    const users = getDb().collection('users');
    return users.updateOne(
        { webId },
        {
            $set: {
                privateReplays,
            },
        },
    );
};

export const getReplays = async (
    mapName?: string,
    playerName?: string,
    mapUId?: string,
    raceFinished?: string,
    orderBy?: string,
    maxResults: string = '1000',
    currentUserRef?: string,
): Promise<any> => {
    const replays = getDb().collection('replays');

    const pipeline = [];

    const matchCondition: any = (currentUserRef && ObjectId.isValid(currentUserRef))
        ? {
            $or: [
                { private: { $ne: true } },
                { userRef: new ObjectId(currentUserRef) },
            ],
        }
        : { private: { $ne: true } };

    pipeline.push({
        $match: matchCondition,
    });

    const map = await getMapByUId(mapUId);
    if (map && map._id) {
        pipeline.push({
            $match: {
                mapRef: map._id,
            },
        });
    }

    pipeline.push(...[
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
        {
            $project: {
                clientCode: 0,
                objectPath: 0,
            },
        },
    ]);

    const addRegexFilter = (property?: string, propertyName?: string) => {
        if (property) {
            pipeline.push({
                $match: {
                    [propertyName as string]: {
                        $regex: `.*${property}.*`,
                        $options: 'i',
                    },
                },
            } as any);
        }
    };
    addRegexFilter(mapName, 'mapName');
    addRegexFilter(playerName, 'playerName');

    if (raceFinished && raceFinished !== '-1') {
        pipeline.push({
            $match: {
                raceFinished: parseInt(raceFinished, 10),
            },
        } as any);
    }

    if (orderBy && orderBy !== 'None') {
        const order: { endRaceTime?: number, date?: number } = {};
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
    replayId?: string,
    populate?: boolean,
): Promise<any> => {
    const replays = getDb().collection('replays');

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
    const replays = getDb().collection('replays');
    await replays.deleteOne({
        _id: new ObjectId(replayId),
    });
};

export const getReplayByFilePath = async (filePath?: string): Promise<any> => {
    const replays = getDb().collection('replays');
    return replays.findOne({ filePath });
};

export const saveReplayMetadata = (
    metadata: any,
): Promise<{ _id: string }> => new Promise((resolve: Function, reject: Rejector) => {
    const replays = getDb().collection('replays');
    replays.insertOne(metadata)
        .then(({ insertedId }: { insertedId: ObjectId }) => resolve({ _id: insertedId }))
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
    const sessions = getDb().collection('sessions');
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
    const sessions = getDb().collection('sessions');
    return sessions.replaceOne({ _id: session._id }, session);
};

export const findSessionBySecret = async (sessionId: string) => {
    const sessions = getDb().collection('sessions');
    return sessions.findOne({ sessionId });
};

export const findSessionByClientCode = async (clientCode: string) => {
    const sessions = getDb().collection('sessions');
    return sessions.findOne({ clientCode });
};

export const deleteSession = async (sessionId: string) => {
    const sessions = getDb().collection('sessions');
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
    const sessions = getDb().collection('sessions');
    const session = await sessions.findOne({
        sessionId,
    });

    // Return undefined if session is not valid
    if (session === undefined || session === null) {
        return undefined;
    }

    // Find user
    const users = getDb().collection('users');
    const user = await users.findOne({
        _id: session.userRef,
    });

    // Return undefined if user could not be found
    if (user === undefined || user === null) {
        return undefined;
    }

    return user;
};
