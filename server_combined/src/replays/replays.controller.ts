import {
    Controller, Get, NotFoundException, Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReplaysService } from './replays.service';
import { Replay } from './schemas/replay.schema';

@ApiTags('replays')
@Controller('replays')
export class ReplaysController {
    constructor(private readonly replaysService: ReplaysService) {}

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
}
