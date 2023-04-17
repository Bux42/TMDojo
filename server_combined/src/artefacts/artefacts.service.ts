import { Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { compress, decompress } from '../common/util/compression';
import { UploadReplayDto } from '../replays/dto/UploadReplay.dto';
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

        if (buffer == null) {
            throw new NotFoundException("Failed to retrieve replay's data buffer");
        }

        const decompressed = decompress(buffer);

        return decompressed;
    }

    async uploadReplayObject(uploadReplayDto: UploadReplayDto, replayBuffer: Buffer) {
        // Create filePath
        // TODO: add correct fields and correct filepath
        const { mapUId, endRaceTime, webId } = uploadReplayDto;
        const filePath = `${mapUId}/${webId}_${endRaceTime}_${Date.now()}`;

        // Compress buffer
        const compressedBuffer = compress(replayBuffer);

        // Save buffer
        if (process.env.PREFERRED_STORAGE_TYPE === 'FS') {
            return this.localArtefactsService.saveObject(filePath, compressedBuffer);
        }

        if (process.env.PREFERRED_STORAGE_TYPE === 'S3') {
            return this.s3Service.uploadObject(filePath, compressedBuffer);
        }

        throw new NotImplementedException('Replay upload not implemented yet');
    }
}
