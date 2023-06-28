import {
    Injectable, Logger, NotFoundException, NotImplementedException,
} from '@nestjs/common';
import { Readable } from 'stream';
import { compress, decompress } from '../common/util/compression';
import { Map } from '../maps/schemas/map.schema';
import { UploadReplayDto } from '../replays/dto/UploadReplay.dto';
import { Replay } from '../replays/schemas/replay.schema';
import { UserRo } from '../users/dto/user.ro';
import { LocalArtefactsService } from './services/localArtefacts.service';
import { S3Service } from './services/s3.service';

@Injectable()
export class ArtefactsService {
    logger: Logger;

    constructor(
        private readonly s3Service: S3Service,
        private readonly localArtefactsService: LocalArtefactsService,
    ) {
        this.logger = new Logger(ArtefactsService.name);
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

    async storeReplayObject(uploadReplayDto: UploadReplayDto, map: Map, user: UserRo, replayBuffer: Buffer) {
        // Create filePath
        // TODO: add correct fields and correct filepath
        const { playerName } = user;
        const { endRaceTime } = uploadReplayDto;
        const { authorName, mapName } = map;
        const fileName = `${endRaceTime}_${playerName}_${Date.now()}`;
        const filePath = `${authorName}/${mapName}/${fileName}`;

        this.logger.debug(`Storing replay object with path: ${filePath}`);

        // Compress buffer
        const compressedBuffer = compress(replayBuffer);

        // eslint-disable-next-line max-len
        this.logger.debug(`Compressed replay object from ${(replayBuffer.byteLength / 1024).toFixed(1)} kb to ${(compressedBuffer.byteLength / 1024).toFixed(1)} kb.`);

        // Save buffer
        if (process.env.PREFERRED_STORAGE_TYPE === 'FS') {
            this.logger.debug('Storing replay object in local file system');
            return this.localArtefactsService.storeObject(filePath, compressedBuffer);
        }

        if (process.env.PREFERRED_STORAGE_TYPE === 'S3') {
            this.logger.debug('Storing replay object in S3');
            return this.s3Service.storeObject(filePath, compressedBuffer);
        }

        throw new NotImplementedException('Replay upload not implemented yet');
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
