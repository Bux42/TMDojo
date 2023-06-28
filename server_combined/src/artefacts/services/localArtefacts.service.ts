import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import * as path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

const LOCAL_ARTEFACT_FOLDER = path.resolve(__dirname, '../../..');

@Injectable()
export class LocalArtefactsService {
    logger: Logger;

    constructor() {
        this.logger = new Logger(LocalArtefactsService.name);
    }

    async getObject(key: string): Promise<Buffer> {
        const fullPath = path.resolve(LOCAL_ARTEFACT_FOLDER, key);

        this.logger.debug(`Getting object from ${fullPath}`);

        try {
            return await readFile(fullPath);
        } catch (error) {
            if (error?.code === 'ENOENT') {
                // TODO: add log
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteObject(key: string) {
        throw new NotImplementedException('Deleting local objects not implemented');
    }
}
