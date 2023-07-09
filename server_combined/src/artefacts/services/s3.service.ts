import { Injectable, NotFoundException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { InjectS3 } from 'nestjs-s3';
import { MyLogger } from '../../common/logger/my-logger.service';
import { DeleteReplayObjectResponse } from '../artefacts.service';

@Injectable()
export class S3Service {
    constructor(
        @InjectS3() private readonly s3: S3,
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(S3Service.name);
    }

    async getObject(key: string): Promise<Buffer> {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        };

        this.logger.debug(`Retrieving object with key: ${key}, from bucket: ${process.env.AWS_S3_BUCKET_NAME}`);

        const data = await this.s3.getObject(params).promise();

        if (data === null || data.Body === null) {
            this.logger.debug(`Object with key: ${key}, from bucket: ${process.env.AWS_S3_BUCKET_NAME} not found`);
            throw new NotFoundException('Object not found');
        }

        if (!(data.Body instanceof Buffer)) {
            // eslint-disable-next-line max-len
            this.logger.debug(`Retrieved object with key: ${key}, from bucket: ${process.env.AWS_S3_BUCKET_NAME} is not a buffer`);
            throw new NotFoundException('Retrieved object is not a buffer');
        }

        return data.Body;
    }

    async storeObject(key: string, buffer: Buffer) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
        };

        // eslint-disable-next-line max-len
        this.logger.debug(`Storing object of size ${(buffer.byteLength / 1024).toFixed(1)} kb, with key: ${key}, in bucket: ${process.env.AWS_S3_BUCKET_NAME}`);

        return this.s3.putObject(params).promise();
    }

    async deleteObject(key: string): Promise<DeleteReplayObjectResponse> {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        };

        const deleteRes = await this.s3.deleteObject(params).promise();

        // Return error if deletion has failed
        if (deleteRes.$response.error !== null && deleteRes.$response.error !== undefined) {
            return { error: deleteRes.$response.error } as const;
        }

        return { success: true } as const;
    }
}
