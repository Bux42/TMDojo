import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { readFile, unlink, writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { DeleteReplayObjectResponse } from '../artefacts.service';
import { MyLogger } from '../../../logger/my-logger.service';

const LOCAL_ARTEFACT_FOLDER = path.resolve(__dirname, '../../..');

@Injectable()
export class LocalArtefactsService {
    constructor(
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(LocalArtefactsService.name);
    }

    async getObject(key: string): Promise<Buffer | null> {
        const fullPath = path.resolve(LOCAL_ARTEFACT_FOLDER, key);

        this.logger.debug(`Getting object from ${fullPath}`);

        try {
            return await readFile(fullPath);
        } catch (error) {
            if (error instanceof Object && 'code' in error && error?.code === 'ENOENT') {
                // TODO: add log
                this.logger.debug(`File does not exist at ${fullPath}`);
                return null;
            }
            throw error;
        }
    }

    async storeObject(key: string, buffer: Buffer): Promise<void> {
        const fullPath = path.resolve(LOCAL_ARTEFACT_FOLDER, key);
        this.logger.debug(`Storing object at ${fullPath}`);

        // Create directory if it doesn't exist
        const directoryPath = path.resolve(fullPath, '../');
        if (!existsSync(directoryPath)) {
            this.logger.debug(`Parent directory does not exist, creating directory ${directoryPath}`);
            mkdirSync(directoryPath, { recursive: true });
        }

        this.logger.debug(`Writing file to ${fullPath}`);
        await writeFile(fullPath, buffer);
    }

    async deleteObject(key: string): Promise<DeleteReplayObjectResponse> {
        try {
            const fullPath = path.resolve(LOCAL_ARTEFACT_FOLDER, key);
            this.logger.debug(`Deleting object at ${fullPath}`);

            // Specifically await this before returning to potentially catch an ENOENT error
            await unlink(fullPath);

            return { success: true } as const;
        } catch (error) {
            if (error instanceof Object && 'code' in error && error?.code === 'ENOENT') {
                // Silently catch error if the file doesn't exist and therefore can't be deleted
                // Return success since the file has already been deleted
                return { success: true } as const;
            }

            return { error } as const;
        }
    }
}
