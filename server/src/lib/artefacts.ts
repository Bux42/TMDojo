import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile, unlink } from 'fs/promises';
import * as path from 'path';
import * as zlib from 'zlib';

import { S3 } from '@aws-sdk/client-s3';

const { PREFERRED_STORAGE_TYPE, AWS_S3_BUCKET_NAME, AWS_S3_REGION } = process.env;

export enum StorageType {
    ObjectStorage = 'S3',
    FileStorage = 'FS'
}

// no explicit auth because it implicitly relies on env vars to exist
// AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
const S3Client = new S3({
    region: AWS_S3_REGION,
});

// helper method to convert stream to buffer (S3 responds with streams)
const streamToBuffer = (stream: any): Promise<Buffer> => new Promise(
    (resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    },
);

const compress = (input: string|Buffer): Buffer => zlib.gzipSync(input);
const decompress = (input: Buffer): Buffer => zlib.unzipSync(input);

// generic helper method for uploading artefacts (includes compression)
export const uploadObject = async (storageType: StorageType, key: string, value: string|Buffer) => {
    if (storageType === StorageType.ObjectStorage) {
        const params = {
            Bucket: AWS_S3_BUCKET_NAME,
            Key: key,
            Body: compress(value),
        };
        return S3Client.putObject(params);
    }

    if (storageType === StorageType.FileStorage) {
        // create directories if necessary
        const keySegments = key.split('/');
        for (let i = 1; i < keySegments.length; i++) {
            const combinedSegments = keySegments.slice(0, i).join('/');
            const realPath = path.resolve(`${__dirname}/../../${combinedSegments}`);
            if (!existsSync(realPath)) {
                mkdirSync(realPath);
            }
        }

        const fullPath = path.resolve(`${__dirname}/../../${key}`);
        return writeFile(fullPath, compress(value));
    }

    throw new Error(`Invalid storageType "${storageType}"`);
};

// generic helper method for fetching artefacts (includes decompression)
export const retrieveObject = async (storageType: StorageType, key: string) => {
    try {
        if (storageType === StorageType.ObjectStorage) {
            const params = {
                Bucket: AWS_S3_BUCKET_NAME,
                Key: key,
            };
            const data = await S3Client.getObject(params);
            return decompress(await streamToBuffer(data.Body));
        }

        if (storageType === StorageType.FileStorage) {
            const fullPath = path.resolve(`${__dirname}/../../${key}`);
            const data = await readFile(fullPath);
            return decompress(data);
        }

        throw new Error(`Invalid storageType ${storageType}`);
    } catch (error) {
        if (error?.message === 'NoSuchKey' || error?.code === 'ENOENT') {
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
const deleteObject = async (storageType: StorageType, key: string) => {
    try {
        if (storageType === StorageType.ObjectStorage) {
            const params = {
                Bucket: AWS_S3_BUCKET_NAME,
                Key: key,
            };
            return S3Client.deleteObject(params);
        }

        if (storageType === StorageType.FileStorage) {
            const fullPath = path.resolve(`${__dirname}/../../${key}`);
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
export const uploadMap = async (mapUID: string, mapData: Buffer) => {
    const key = `mapBlocks/${mapUID}`;
    await uploadObject(StorageType.FileStorage, key, mapData);
    return key;
};

/**
 * Fetch map data from the server file system
 * Only supports FS at the moment
 */
export const retrieveMap = async (mapUID: string) => retrieveObject(StorageType.FileStorage, `mapBlocks/${mapUID}`);

/**
 * Delete map data from the server file system
 * Only supports FS at the moment
 */
export const deleteMap = async (mapUID: string) => deleteObject(StorageType.FileStorage, `mapBlocks/${mapUID}`);

/**
 * Upload replay data to the preferred storage type
 * Returns an object with either filePath or objectPath (indicating which storage type it used)
 */
export const uploadReplay = async (replayPath: string, replayData: string) => {
    let key;
    let keyProperty; // used to report back how the reference needs to be stored in the db

    // replay data needs to be turned into a base64-encoded buffer first
    const dataBuffer = Buffer.from(replayData, 'base64');

    if (PREFERRED_STORAGE_TYPE === StorageType.ObjectStorage) {
        key = `maps/${replayPath}`;
        keyProperty = 'objectPath';
        await uploadObject(StorageType.ObjectStorage, key, dataBuffer);
    } else if (PREFERRED_STORAGE_TYPE === StorageType.FileStorage) {
        key = `maps/${replayPath}.gz`;
        keyProperty = 'filePath';
        await uploadObject(StorageType.FileStorage, key, dataBuffer);
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
export const retrieveReplay = async (replayMetadata: any) => {
    let storageType;
    let key;

    if (replayMetadata?.objectPath) {
        storageType = StorageType.ObjectStorage;
        key = replayMetadata.objectPath;
    } else if (replayMetadata?.filePath) {
        storageType = StorageType.FileStorage;
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
export const deleteReplay = async (replayMetadata: any) => {
    let storageType;
    let key;

    if (replayMetadata.objectPath) {
        storageType = StorageType.ObjectStorage;
        key = replayMetadata.objectPath;
    } else if (replayMetadata.filePath) {
        storageType = StorageType.FileStorage;
        key = replayMetadata.filePath;
    } else {
        throw new Error('No object or file in replay');
    }

    return deleteObject(storageType, key);
};
