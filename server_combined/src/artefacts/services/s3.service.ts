import { Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { InjectS3 } from 'nestjs-s3';

@Injectable()
export class S3Service {
    constructor(@InjectS3() private readonly s3: S3) { }

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

        return data.Body;
    }

    async uploadObject(key: string, buffer: Buffer) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
        };

        return this.s3.putObject(params).promise();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteObject(key: string): Promise<unknown> {
        throw new NotImplementedException('Deleting S3 objects not implemented');
    }
}
