const { MongoClient, ObjectID } = require('mongodb');
require('dotenv').config();

const DB_NAME = 'dojo';

let db : any = null;

export type Rejector = (_1 : Error) => void;

export const initDB = () => {
    const mongoClient = new MongoClient(process.env.MONGO_URL, {
        useUnifiedTopology: true,
    });

    mongoClient.connect((err : Error) => {
        if (err) {
            console.error('initDB: Could not connect to DB, shutting down');
            process.exit();
        }
        console.log('initDB: Connected successfully to DB');
        db = mongoClient.db(DB_NAME);
    });
};

export const authenticateUser = (webId : any, login : any, name : any) : Promise<void> => new Promise((resolve : () => void, reject : Rejector) => {
    const users = db.collection('users');
    users
        .find({
            webId,
        })
        .toArray((err : Error, docs : any) => {
            if (err) {
                reject(err);
            } else if (!docs.length) {
                users.insertOne({
                    webId,
                    playerLogin: login,
                    playerName: name,
                    last_active: Date.now(),
                });
                resolve();
            } else {
                const updatedUser = {
                    $set: {
                        playerLogin: login,
                        playerName: name,
                        last_active: Date.now(),
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

export const getUniqueMapNames = (mapName ?: string) : Promise<any> => new Promise((resolve : Function, reject : Rejector) => {
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
    replays.aggregate(queryPipeline, async (aggregateErr : Error, cursor : any) => {
        if (aggregateErr) {
            return reject(aggregateErr);
        }
        try {
            const data = await cursor.toArray();
            return resolve(data);
        } catch (arrayErr) {
            return reject(arrayErr);
        }
    });
});

export const getMapByUId = (mapUId ?: string) : Promise<any> => new Promise((resolve : Function, reject : Rejector) => {
    const maps = db.collection('maps');
    maps.findOne({ mapUId }, (err : Error, map : any) => {
        if (err) {
            return reject(err);
        }
        return resolve(map);
    });
});

export const saveMap = (mapData ?: any) : Promise<any> => new Promise((resolve : Function, reject : Rejector) => {
    const maps = db.collection('maps');
    maps.insertOne(mapData)
        .then((operation : any) => resolve({ _id: operation.insertedId }))
        .catch((error : Error) => reject(error));
});

export const getUserByWebId = (webId ?: string) : Promise<any> => new Promise((resolve : Function, reject : Rejector) => {
    const users = db.collection('users');
    users.findOne({ webId }, (err : Error, user : any) => {
        if (err) {
            return reject(err);
        }
        return resolve(user);
    });
});

export const saveUser = (userData : any) : Promise<{_id: string}> => new Promise((resolve : (_1 : {_id: string}) => void, reject : Rejector) => {
    const users = db.collection('users');
    users.insertOne(userData)
        .then(({insertedId} : {insertedId: string}) => resolve({ _id: insertedId }))
        .catch((error : Error) => reject(error));
});

export const getReplays = (
    mapName ?: string, playerName ?: string, mapUId ?: string, raceFinished ?: string, orderBy ?: string, maxResults : string = '1000',
) : Promise<any> => new Promise((resolve : Function, reject : Rejector) => {
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
        const order : {endRaceTime?: number, date?: number} = {};
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

    replays.aggregate(pipeline, async (aggregateErr : Error, cursor : any) => {
        if (aggregateErr) {
            return reject(aggregateErr);
        }
        try {
            const data = await cursor.toArray();
            return resolve({ files: data, totalResults: data.length });
        } catch (arrayErr) {
            return reject(arrayErr);
        }
    });
});

export const getReplayById = (replayId ?: string, populate ?: boolean) : Promise<any> => new Promise((resolve : Function, reject : Rejector) => {
    const replays = db.collection('replays');

    let pipeline = [
        {
            $match: { _id: ObjectID(replayId) },
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

    replays.aggregate(pipeline, async (aggregateErr : Error, cursor : any) => {
        if (aggregateErr) {
            return reject(aggregateErr);
        }
        try {
            const data = await cursor.toArray();
            return resolve(data[0]);
        } catch (arrayErr) {
            return reject(arrayErr);
        }
    });
});

export const getReplayByFilePath = (filePath ?: string) : Promise<any> => new Promise((resolve : Function, reject : Rejector) => {
    const replays = db.collection('replays');
    replays.findOne({ filePath }, (err : Error, replay : any) => {
        if (err) {
            return reject(err);
        }
        return resolve(replay);
    });
});

export const saveReplayMetadata = (metadata : any) : Promise<{_id: string}> => new Promise((resolve : (_1: {_id: string}) => void, reject : Rejector) => {
    const replays = db.collection('replays');
    replays.insertOne(metadata)
        .then(({insertedId} : {insertedId: string}) => resolve({ _id: insertedId }))
        .catch((error : Error) => reject(error));
});
