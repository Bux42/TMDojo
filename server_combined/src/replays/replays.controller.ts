import {
    Controller, Delete, Get, NotFoundException, Param, Post, Query, StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArtefactsService } from '../artefacts/artefacts.service';
import { ListReplaysDto } from './dto/ListReplays.dto';
import { UploadReplayDto } from './dto/UploadReplay.dto';
import { ReplaysService } from './replays.service';
import { Replay } from './schemas/replay.schema';

@ApiTags('replays')
@Controller('replays')
export class ReplaysController {
    constructor(
        private readonly replaysService: ReplaysService,
        private readonly artefactsService: ArtefactsService,
    ) { }

    @ApiOperation({
        summary: 'TODO: Check functionality and return types',
    })
    @Get()
    async findAll(@Query() listReplayOptions: ListReplaysDto) : Promise<Replay[]> {
        const replays = await this.replaysService.findAll(listReplayOptions);
        return replays.map((r) => r);
    }

    @ApiOperation({
        summary: 'TODO: Check functionality and return types',
    })
    @Get(':replayId')
    async findOne(@Param('replayId') replayId: string) : Promise<Replay> {
        const replay = await this.replaysService.findById(replayId);

        if (!replay) {
            throw new NotFoundException(`Replay not found with replay ID: ${replayId}`);
        }

        return replay;
    }

    @ApiOperation({
        summary: 'TODO: Implement artefact upload and check functionality and return types',
    })
    @Post()
    uploadReplay(@Query() uploadReplayDto: UploadReplayDto) {
        return this.replaysService.uploadReplay(uploadReplayDto);
    }

    @ApiOperation({
        summary: 'TODO: Delete replay artefact (replay is being deleted from DB atm)',
    })
    @Delete(':replayId')
    async delete(@Param('replayId') replayId: string) : Promise<Replay> {
        const replay = await this.replaysService.deleteReplay(replayId);

        if (!replay) {
            throw new NotFoundException(`Replay not found with ID: ${replayId}`);
        }

        return replay;
    }

    @ApiOperation({
        summary: 'TODO: Implement artefact fetching',
    })
    @Get(':replayId/file')
    async s3Test(@Param('replayId') replayId: string): Promise<StreamableFile> {
        const replay = await this.replaysService.findById(replayId);

        if (!replay) {
            throw new NotFoundException(`Replay not found with ID: ${replayId}`);
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
