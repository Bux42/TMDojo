import {
    Controller, Get, NotFoundException, Param, Post, Query, StreamableFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ArtefactsService } from '../artefacts/artefacts.service';
import { ListReplaysDto } from './dto/ListReplays.dto';
import { UploadReplayDto } from './dto/UploadReplay.dto';
import { ReplaysService } from './replays.service';
import { ReplayRo } from './ro/Replay.ro';
import { Replay } from './schemas/replay.schema';

@ApiTags('replays')
@Controller('replays')
export class ReplaysController {
    constructor(
        private readonly replaysService: ReplaysService,
        private readonly artefactsService: ArtefactsService,
    ) { }

    @Get()
    async getReplays(@Query() listReplayOptions: ListReplaysDto): Promise<ReplayRo[]> {
        const replays = await this.replaysService.findAll(listReplayOptions);
        return replays.map((r) => Replay.toRo(r));
    }

    @Post()
    async uploadReplay(@Query() uploadReplayDto: UploadReplayDto): Promise<ReplayRo> {
        const replay = await this.replaysService.uploadReplay(uploadReplayDto);
        return Replay.toRo(replay);
    }

    @Get(':replayId')
    async getReplayById(@Param('replayId') replayId: string): Promise<ReplayRo> {
        const replay = await this.replaysService.findById(replayId);

        if (!replay) {
            throw new NotFoundException(`Replay not found with replay ID: ${replayId}`);
        }

        return Replay.toRo(replay);
    }

    @Get(':replayId/file')
    async s3Test(@Param('replayId') replayId: string): Promise<StreamableFile> {
        const replay = await this.replaysService.findById(replayId);

        if (!replay) {
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
