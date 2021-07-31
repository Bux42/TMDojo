const { S3, NoSuchKey } = require('@aws-sdk/client-s3');
const { existsSync, mkdirSync } = require('fs');
const { readFile, writeFile, unlink } = require('fs/promises');
const path = require('path');
const zlib = require('zlib');
require('dotenv').config();

const { PREFERRED_STORAGE_TYPE, AWS_S3_BUCKET_NAME } = process.env;
const REGION = 'eu-central-1';

const STORAGE_TYPE_S3 = 'S3';
const STORAGE_TYPE_FS = 'FS';

const S3Client = new S3({
    region: REGION,
});

const streamToBuffer = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
});

const compress = (input) => zlib.gzipSync(input);
const decompress = (input) => zlib.unzipSync(input);

const uploadObject = async (storageType, key, value) => {
    if (storageType === STORAGE_TYPE_S3) {
        const params = {
            Bucket: AWS_S3_BUCKET_NAME,
            Key: key,
            Body: compress(value),
        };
        return S3Client.putObject(params);
    }

    if (storageType === STORAGE_TYPE_FS) {
        // create directories if necessary
        const keySegments = key.split('/');
        for (let i = 1; i < keySegments.length; i++) {
            const combinedSegments = keySegments.slice(0, i).join('/');
            const realPath = path.resolve(`${__dirname}/../${combinedSegments}`);
            if (!existsSync(realPath)) {
                mkdirSync(realPath);
            }
        }

        const fullPath = path.resolve(`${__dirname}/../${key}`);
        return writeFile(fullPath, compress(value));
    }

    throw new Error({ message: `Invalid storageType "${storageType}"` });
};

const retrieveObject = async (storageType, key) => {
    try {
        if (storageType === STORAGE_TYPE_S3) {
            const params = {
                Bucket: AWS_S3_BUCKET_NAME,
                Key: key,
            };
            const data = await S3Client.getObject(params);
            return decompress(await streamToBuffer(data.Body));
        }

        if (storageType === STORAGE_TYPE_FS) {
            const fullPath = path.resolve(`${__dirname}/../${key}`);
            const data = await readFile(fullPath);
            return decompress(data);
        }

        throw new Error({ message: `Invalid storageType ${storageType}` });
    } catch (error) {
        if (typeof error === typeof NoSuchKey || error?.code === 'ENOENT') {
            throw new Error({ message: 'Object not found' });
        } else {
            throw error;
        }
    }
};

// linter complains about missing return in catch, but we'd need to return a nonsense value to make it happy
// eslint-disable-next-line consistent-return
const deleteObject = async (storageType, key) => {
    try {
        if (storageType === STORAGE_TYPE_S3) {
            const params = {
                Bucket: AWS_S3_BUCKET_NAME,
                Key: key,
            };
            return S3Client.deleteObject(params);
        }

        if (storageType === STORAGE_TYPE_FS) {
            const fullPath = path.resolve(`${__dirname}/../${key}`);
            // specifically await this before returning to potentially catch an ENOENT error
            return await unlink(fullPath);
        }

        throw new Error(`Invalid storageType ${storageType}`);
    } catch (error) {
        if (!error.code || error.code !== 'ENOENT') {
            // silently catch error if the file doesn't exist and therefore can't be deleted
            throw error;
        }
    }
};

// TODO: support S3 for map artefacts
// this requires some work on the db data model since the map data isn't referenced in db yet
const uploadMap = async (mapUID, mapData) => {
    const key = `mapBlocks/${mapUID}`;
    await uploadObject(STORAGE_TYPE_FS, key, mapData);
    return key;
};

const retrieveMap = async (mapUID) => retrieveObject(STORAGE_TYPE_FS, `mapBlocks/${mapUID}`);

const deleteMap = async (mapUID) => deleteObject(STORAGE_TYPE_FS, `mapBlocks/${mapUID}`);

const uploadReplay = async (replayPath, replayData) => {
    let key;
    let keyProperty; // used to report back how the reference needs to be stored in the db

    if (PREFERRED_STORAGE_TYPE === STORAGE_TYPE_S3) {
        key = `maps/${replayPath}`;
        keyProperty = 'objectPath';
        await uploadObject(STORAGE_TYPE_S3, key, replayData);
    } else if (PREFERRED_STORAGE_TYPE === STORAGE_TYPE_FS) {
        key = `maps/${replayPath}.gz`;
        keyProperty = 'filePath';
        await uploadObject(STORAGE_TYPE_FS, key, replayData);
    } else {
        throw new Error({ message: `Invalid preferred storage type "${PREFERRED_STORAGE_TYPE}"` });
    }

    return {
        [keyProperty]: key,
    };
};

const retrieveReplay = async (replayMetadata) => {
    let storageType;
    let key;

    if (replayMetadata?.objectPath) {
        storageType = STORAGE_TYPE_S3;
        key = replayMetadata.objectPath;
    } else if (replayMetadata?.filePath) {
        storageType = STORAGE_TYPE_FS;
        key = replayMetadata.filePath;
    } else {
        throw new Error({ message: 'No object or file in replay' });
    }

    return retrieveObject(storageType, key);
};

const deleteReplay = async (replayMetadata) => {
    let storageType;
    let key;

    if (replayMetadata.objectPath) {
        storageType = STORAGE_TYPE_S3;
        key = replayMetadata.objectPath;
    } else if (replayMetadata.filePath) {
        storageType = STORAGE_TYPE_FS;
        key = replayMetadata.filePath;
    } else {
        throw new Error({ message: 'No object or file in replay' });
    }

    return deleteObject(storageType, key);
};

module.exports = {
    retrieveMap,
    uploadMap,
    deleteMap,
    retrieveReplay,
    uploadReplay,
    deleteReplay,
};
