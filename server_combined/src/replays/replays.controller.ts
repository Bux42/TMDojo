import {
    Controller, Delete, Get, Param, Post,
} from '@nestjs/common';
import { ReplaysService } from './replays.service';

@Controller('replays')
export class ReplaysController {
    constructor(private readonly replaysService: ReplaysService) {}

    @Get()
    getReplays(): string[] {
        return this.replaysService.getReplays();
    }

    @Get(':replayId')
    getReplayById(@Param('replayId') replayId: string): string {
        return this.replaysService.getReplayById(replayId);
    }

    @Delete(':replayId')
    deleteReplayById(@Param('replayId') replayId: string): string {
        return this.replaysService.deleteReplayById(replayId);
    }

    @Post()
    uploadReplay(): string {
        return this.replaysService.uploadReplay();
    }

    // TODO: Remove this endpoint and adjust /replays to accept userWebId as filter
    @Get(':webId/replays')
    getUserReplays(@Param('webId') webId: string): string[] {
        return this.replaysService.getUserReplaysByWebId(webId);
    }
}
