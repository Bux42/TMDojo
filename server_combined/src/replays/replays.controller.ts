import {
    Controller, Get, NotFoundException, Param, StreamableFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ArtefactsService } from '../artefacts/artefacts.service';
import { ReplaysService } from './replays.service';
import { Replay } from './schemas/replay.schema';

@ApiTags('replays')
@Controller('replays')
export class ReplaysController {
    constructor(
        private readonly replaysService: ReplaysService,
        private readonly artefactsService: ArtefactsService,
    ) {}

    @Get()
    getReplays(): Promise<Replay[]> {
        return this.replaysService.findAll();
    }

    @Get(':replayId')
    async getReplayById(@Param('replayId') replayId: string): Promise<Replay> {
        const replay = await this.replaysService.findById(replayId);

        if (replay === null) {
            throw new NotFoundException(`Replay not found with replay ID: ${replayId}`);
        }

        return replay;
    }

    @Get(':replayId/file')
    async s3Test(@Param('replayId') replayId: string): Promise<StreamableFile> {
        const replay = await this.replaysService.findById(replayId);

        if (replay === null) {
            throw new NotFoundException('Replay not found');
        }

        const buffer = await this.artefactsService.retrieveReplayObject(replay);

        if (buffer === null) {
            throw new NotFoundException('Unable to fetch replay file buffer');
        }

        return new StreamableFile(
            buffer,
            { disposition: `attachment; filename=${replayId}` },
        );
    }
}
