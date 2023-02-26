import { Injectable, NotImplementedException } from '@nestjs/common';
import * as path from 'path';
import { readFile } from 'fs/promises';
import { decompress } from '../../common/util/compression';

const LOCAL_ARTEFACT_FOLDER = `${__dirname}/../../..`;

@Injectable()
export class LocalArtefactsService {
    constructor() { }

    async retrieveObject(key: string): Promise<Buffer> {
        const fullPath = path.resolve(`${LOCAL_ARTEFACT_FOLDER}/${key}`);

        try {
            const data = await readFile(fullPath);
            return decompress(data);
        } catch (error) {
            if (error?.code === 'ENOENT') {
                // TODO: add log
                return null;
            }
            throw error;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async saveObject(key: string, value: Buffer): Promise<unknown> {
        throw new NotImplementedException('Saving local objects not implemented');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteObject(key: string): Promise<unknown> {
        throw new NotImplementedException('Deleting local objects not implemented');
    }
}
