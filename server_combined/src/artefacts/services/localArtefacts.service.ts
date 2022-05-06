import { Injectable, NotImplementedException } from '@nestjs/common';
import { AWSError, S3 } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import * as path from 'path';
import { readFile } from 'fs/promises';
import { decompress } from '../../common/util/compression';

@Injectable()
export class LocalArtefactsService {
    constructor() {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async saveObject(key: string, value: Buffer): Promise<PromiseResult<S3.PutObjectOutput, AWSError>> {
        throw new NotImplementedException('Saving local objects not implemented');
    }

    async retrieveObject(key: string): Promise<Buffer> {
        const fullPath = path.resolve(`${__dirname}/../../../${key}`);

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
}
