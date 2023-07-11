import { Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { Readable } from 'stream';
import { MyLogger } from '../../logger/my-logger.service';
import { compress, decompress } from '../../util/compression';
import { MapRo } from '../../../maps/dto/map.ro';
import { UploadReplayDto } from '../../../replays/dto/upload-replay.dto';
import { Replay } from '../../../replays/schemas/replay.schema';
import { UserRo } from '../../../users/dto/user.ro';
import { LocalArtefactsService } from './services/local-artefacts.service';
import { S3Service } from './services/s3.service';

export type DeleteReplayObjectResponse = {
    success: true;
} | {
    error: any;
}

@Injectable()
export class ArtefactsService {
    constructor(
        private readonly s3Service: S3Service,
        private readonly localArtefactsService: LocalArtefactsService,
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(ArtefactsService.name);
    }

    async getReplayObject(replay: Replay): Promise<Buffer> {
        let buffer: Buffer = null;

        if (replay.objectPath) {
            buffer = await this.s3Service.getObject(`${replay.objectPath}`);
        } else if (replay.filePath) {
            buffer = await this.localArtefactsService.getObject(`${replay.filePath}`);
        } else {
            throw new NotFoundException('No object or file path in replay');
        }

        if (buffer == null) {
            throw new NotFoundException("Failed to retrieve replay's data buffer");
        }

        const decompressedBuffer = decompress(buffer);

        return decompressedBuffer;
    }

    async storeReplayObject(uploadReplayDto: UploadReplayDto, map: MapRo, user: UserRo, replayBuffer: Buffer) {
        // Create filePath
        // TODO: add correct fields and correct filepath
        const { playerName } = user;
        const { endRaceTime } = uploadReplayDto;
        const { authorName, mapName } = map;
        const fileName = `${endRaceTime}_${playerName}_${Date.now()}`;
        const filePath = `maps/${authorName}/${mapName}/${fileName}`;

        this.logger.debug(`Storing replay object with path: ${filePath}`);

        // Compress buffer
        const compressedBuffer = compress(replayBuffer);

        // eslint-disable-next-line max-len
        this.logger.debug(`Compressed replay object from ${(replayBuffer.byteLength / 1024).toFixed(1)} kb to ${(compressedBuffer.byteLength / 1024).toFixed(1)} kb.`);

        // Save buffer
        if (process.env.PREFERRED_STORAGE_TYPE === 'FS') {
            this.logger.debug('Storing replay object in local file system');
            await this.localArtefactsService.storeObject(filePath, compressedBuffer);
            return { filePath } as const;
        }

        if (process.env.PREFERRED_STORAGE_TYPE === 'S3') {
            this.logger.debug('Storing replay object in S3');
            const encodedUriFilePath = encodeURI(filePath);
            await this.s3Service.storeObject(encodedUriFilePath, compressedBuffer);
            return { objectPath: encodedUriFilePath } as const;
        }

        throw new NotImplementedException('Replay upload not implemented yet');
    }

    async deleteReplayObject(replay: Replay): Promise<DeleteReplayObjectResponse> {
        this.logger.debug(`Deleting replay object with ID: ${replay._id}`);

        if (replay.objectPath) {
            return this.s3Service.deleteObject(replay.objectPath);
        }

        if (replay.filePath) {
            return this.localArtefactsService.deleteObject(replay.filePath);
        }

        throw new NotFoundException('No object or file path in replay');
    }

    async streamToBuffer(stream: Readable): Promise<Buffer> {
        const chunks: Buffer[] = [];

        return new Promise((resolve, reject) => {
            stream.on('data', (chunk: Buffer) => chunks.push(chunk));
            stream.on('error', (err: Error) => reject(err));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
}
