const { MongoClient, ObjectID } = require('mongodb');
require('dotenv').config();

const DB_NAME = 'dojo';

let db = null;

const initDB = () => {
    const mongoClient = new MongoClient(process.env.MONGO_URL, {
        useUnifiedTopology: true,
    });

    mongoClient.connect((err) => {
        if (err) {
            console.error('initDB: Could not connect to DB, shutting down');
            process.exit();
        }
        console.log('initDB: Connected successfully to DB');
        db = mongoClient.db(DB_NAME);
    });
};

const authenticateUser = (webId, login, name) => new Promise((resolve, reject) => {
    const users = db.collection('users');
    users
        .find({
            webid: webId,
        })
        .toArray((err, docs) => {
            if (err) {
                reject(err);
            } else if (!docs.length) {
                users.insertOne({
                    webid: webId,
                    login,
                    name,
                    last_active: Date.now(),
                });
                resolve();
            } else {
                const updatedUser = {
                    $set: {
                        login,
                        name,
                        last_active: Date.now(),
                    },
                };
                users.updateOne(
                    {
                        webid: webId,
                    },
                    updatedUser,
                );
                resolve();
            }
        });
});

const saveReplayMetadata = (metadata) => new Promise((resolve) => {
    const raceData = db.collection('race_data');
    raceData.insertOne(metadata);
    resolve();
});

const getUniqueMapNames = (mapName) => new Promise((resolve, reject) => {
    const raceData = db.collection('race_data');
    const queryPipeline = [
        {
            $group: {
                _id: '$mapUId',
                mapName: { $first: '$mapName' }, // pass the first instance of mapUId (since it'll always be the same)
                count: {
                    $sum: 1,
                },
            },
        },
        {
            $project: {
                _id: false,
                mapUId: '$_id',
                mapName: true,
                count: '$count',
            },
        },
    ];

    // only filter by name if there's valid input
    if (mapName && mapName !== '') {
        queryPipeline.unshift({
            $match: {
                mapName: { $regex: `.*${mapName}.*`, $options: 'i' },
            },
        });
    }
    raceData.aggregate(queryPipeline, async (aggregateErr, cursor) => {
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

const getReplays = (
    mapName = '', playerName = '', mapUId = '', raceFinished = '-1', orderBy = 'None', maxResults = '1000',
) => new Promise((resolve, reject) => {
    const raceData = db.collection('race_data');
    const query = {};
    // case-insensitive filter for map and player name
    if (mapName.length > 0) {
        query.mapName = {
            $regex: `.*${mapName}.*`,
            $options: 'i',
        };
    }
    if (playerName.length > 0) {
        query.playerName = {
            $regex: `.*${playerName}.*`,
            $options: 'i',
        };
    }
    if (mapUId.length > 0) {
        query.mapUId = {
            $regex: `.*${mapUId}.*`,
        };
    }
    if (raceFinished !== '-1') {
        query.raceFinished = parseInt(raceFinished, 10);
    }
    const order = {};
    if (orderBy.length > 0) {
        if (orderBy === 'Time Desc') {
            order.endRaceTime = -1;
        }
        if (orderBy === 'Time Asc') {
            order.endRaceTime = 1;
        }
        if (orderBy === 'Date Desc') {
            order.date = -1;
        }
        if (orderBy === 'Date Asc') {
            order.date = 1;
        }
    }
    raceData
        .find(query)
        .sort(order)
        .toArray((err, docs) => {
            if (err) {
                return reject(err);
            }
            const files = [];
            for (let i = 0; i < Number(maxResults) && i < docs.length; i++) {
                const doc = docs[i];
                delete doc.file_path; // remove file_path because it's just internal structure
                files.push(doc);
            }
            return resolve({
                files,
                totalResults: docs.length,
            });
        });
});

const getReplayById = (replayId) => new Promise((resolve, reject) => {
    const raceData = db.collection('race_data');
    raceData.findOne({ _id: ObjectID(replayId) }, (err, replay) => {
        if (err) {
            return reject(err);
        }
        return resolve(replay);
    });
});

const getReplayByFilePath = (filePath) => new Promise((resolve, reject) => {
    const raceData = db.collection('race_data');
    raceData.findOne({ file_path: filePath }, (err, replay) => {
        if (err) {
            return reject(err);
        }
        return resolve(replay);
    });
});

module.exports = {
    initDB,
    authenticateUser,
    saveReplayMetadata,
    getUniqueMapNames,
    getReplays,
    getReplayById,
    getReplayByFilePath,
};
