import { Injectable, NotFoundException } from '@nestjs/common';
import { AWSError, S3 } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { InjectS3 } from 'nestjs-s3';
import { compress, decompress } from '../common/util/compression';

@Injectable()
export class S3Service {
    constructor(@InjectS3() private readonly s3: S3) {}

    async uploadObject(key: string, value: Buffer): Promise<PromiseResult<S3.PutObjectOutput, AWSError>> {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: compress(value),
        };

        const res = await this.s3.putObject(params).promise();

        return res;
    }

    async retrieveObject(key: string): Promise<Buffer> {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        };

        const data = await this.s3.getObject(params).promise();

        if (data === null || data.Body === null) {
            throw new NotFoundException('Object not found');
        }

        if (!(data.Body instanceof Buffer)) {
            throw new NotFoundException('Retrieved object is not a buffer');
        }

        const decompressed = decompress(data.Body);

        return decompressed;
    }
}
