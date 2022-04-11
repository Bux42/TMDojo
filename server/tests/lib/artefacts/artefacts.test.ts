import {
    afterAll,
    beforeEach,
    describe, expect, it, jest,
} from '@jest/globals';

// Mock S3 client
const mS3Client = {
    putObject: jest.fn().mockReturnThis(),
};
jest.mock('@aws-sdk/client-s3', () => ({ S3: jest.fn(() => mS3Client) }));

// Mock fs/promises writeFile for local writes
const mFsPromises = {
    writeFile: jest.fn(),
};
jest.mock('fs/promises', () => mFsPromises);

// eslint-disable-next-line import/first
import { compress, uploadReplay } from '../../../src/lib/artefacts';

describe('File Artefacts', () => {
    // Setting and resetting test environment variables: https://stackoverflow.com/a/48042799
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules(); // Most important - it clears the cache
        process.env = { ...OLD_ENV }; // Make a copy
    });

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    it('should upload a replay using S3', async () => {
        // Arrange
        process.env.PREFERRED_STORAGE_TYPE = 'S3';
        process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

        const mapUId = 'MapUId';
        const replayDataBase64 = 'Base64ReplayString';

        // Act
        const returnedPath = await uploadReplay(mapUId, replayDataBase64);

        // Assert
        expect(returnedPath).toStrictEqual({ objectPath: 'maps/MapUId' });
        expect(mS3Client.putObject).toHaveBeenNthCalledWith(1, {
            Bucket: 'test-bucket',
            Key: 'maps/MapUId',
            Body: compress(Buffer.from(replayDataBase64, 'base64')),
        });
    });

    it('should store a replay on the local filesystem', async () => {
        // Arrange
        process.env.PREFERRED_STORAGE_TYPE = 'FS';

        const mapUId = 'MapUId';
        const replayDataBase64 = 'Base64ReplayString';

        // Act
        const returnedPath = await uploadReplay(mapUId, replayDataBase64);

        // Assert
        expect(returnedPath).toStrictEqual({ filePath: 'maps/MapUId.gz' });
        expect(mFsPromises.writeFile).toHaveBeenCalledTimes(1);
    });

    it('should throw an error due to invalid storage type', async () => {
        // Arrange
        process.env.PREFERRED_STORAGE_TYPE = 'INVALID';

        const mapUId = 'MapUId';
        const replayDataBase64 = 'Base64ReplayString';

        // Act + Assert
        await expect(uploadReplay(mapUId, replayDataBase64))
            .rejects
            .toThrow();
    });
});
