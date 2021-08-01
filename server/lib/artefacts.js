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

// no explicit auth because it implicitly relies on env vars to exist
// AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
const S3Client = new S3({
    region: REGION,
});

// helper method to convert stream to buffer (S3 responds with streams)
const streamToBuffer = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
});

const compress = (input) => zlib.gzipSync(input);
const decompress = (input) => zlib.unzipSync(input);

// generic helper method for uploading artefacts (includes compression)
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

    throw new Error(`Invalid storageType "${storageType}"`);
};

// generic helper method for fetching artefacts (includes decompression)
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

        throw new Error(`Invalid storageType ${storageType}`);
    } catch (error) {
        if (typeof error === typeof NoSuchKey || error?.code === 'ENOENT') {
            // translate same problem into single error we can detect later
            throw new Error('Object not found');
        } else {
            throw error;
        }
    }
};

// generic helper method for deleting artefacts (includes catching errors when artefacts doesn't exist)
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
/**
 * Upload map data to the server file system
 * Only supports FS at the moment
 */
const uploadMap = async (mapUID, mapData) => {
    const key = `mapBlocks/${mapUID}`;
    await uploadObject(STORAGE_TYPE_FS, key, mapData);
    return key;
};

/**
 * Fetch map data from the server file system
 * Only supports FS at the moment
 */
const retrieveMap = async (mapUID) => retrieveObject(STORAGE_TYPE_FS, `mapBlocks/${mapUID}`);

/**
 * Delete map data from the server file system
 * Only supports FS at the moment
 */
const deleteMap = async (mapUID) => deleteObject(STORAGE_TYPE_FS, `mapBlocks/${mapUID}`);

/**
 * Upload replay data to the preferred storage type
 * Returns an object with either filePath or objectPath (indicating which storage type it used)
 */
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
        throw new Error(`Invalid preferred storage type "${PREFERRED_STORAGE_TYPE}"`);
    }

    return {
        [keyProperty]: key,
    };
};

/**
 * Fetch replay data from the used storage type
 * Expects replayMetadata to be the DB object (so it can read filePath or objectPath)
 * Returns data as a UTF8 buffer
 */
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
        throw new Error('No object or file in replay');
    }

    return retrieveObject(storageType, key);
};

/**
 * Delete replay data from the used storage type
 * Expects replayMetadata to be the DB object (so it can read filePath or objectPath)
 */
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
        throw new Error('No object or file in replay');
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
