import { Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { AWSError, S3 } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Replay } from '../replays/schemas/replay.schema';
import { LocalArtefactsService } from './services/localArtefacts.service';
import { S3Service } from './services/s3.service';

@Injectable()
export class ArtefactsService {
    constructor(
        private readonly s3Service: S3Service,
        private readonly localArtefactsService: LocalArtefactsService,
    ) { }

    async retrieveReplayObject(replay: Replay): Promise<Buffer> {
        let buffer: Buffer = null;

        if (replay.objectPath) {
            buffer = await this.s3Service.retrieveObject(`${replay.objectPath}`);
        } else if (replay.filePath) {
            buffer = await this.localArtefactsService.retrieveObject(`${replay.filePath}`);
        } else {
            throw new NotFoundException('No object or file path in replay');
        }

        return buffer;
    }

    async uploadReplayObject(): Promise<PromiseResult<S3.PutObjectOutput, AWSError>> {
        throw new NotImplementedException('Replay upload not implemented yet');
    }
}
