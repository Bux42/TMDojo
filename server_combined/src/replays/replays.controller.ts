import {
    Controller, Delete, Get, NotFoundException, Param, Post, Query, StreamableFile, UnauthorizedException,
} from '@nestjs/common';
import { Req, UseGuards } from '@nestjs/common/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ArtefactsService } from '../artefacts/artefacts.service';
import { User } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRo } from '../users/dto/user.ro';
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
    async findAll(@Query() listReplayOptions: ListReplaysDto) {
        const replays = await this.replaysService.findAll(listReplayOptions);
        // TODO: better response type, and create Ro for it
        return {
            replays,
            totalResults: replays.length,
        };
        // return replays.map((r) => r);
    }

    @ApiOperation({
        summary: 'TODO: Check functionality and return types',
    })
    @Get(':replayId')
    async findOne(@Param('replayId') replayId: string): Promise<Replay> {
        const replay = await this.replaysService.findById(replayId);

        if (!replay) {
            throw new NotFoundException(`Replay not found with replay ID: ${replayId}`);
        }

        return replay;
    }

    @ApiOperation({
        summary: 'TODO: Implement artefact upload and check functionality and return types',
    })
    @UseGuards(JwtAuthGuard)
    @Post()
    async uploadReplay(
        @User() loggedInUser: UserRo,
        @Query() uploadReplayDto: UploadReplayDto,
        @Req() req: Request,
    ) {
        const rawReplayBuffer = await this.artefactsService.streamToBuffer(req);

        return this.replaysService.uploadReplay(loggedInUser, uploadReplayDto, rawReplayBuffer);
    }

    @ApiOperation({
        summary: 'TODO: Delete replay artefact (replay is being deleted from DB atm)',
    })
    @UseGuards(JwtAuthGuard)
    @Delete(':replayId')
    async delete(
        @User() loggedInUser: UserRo,
        @Param('replayId') replayId: string,
    ): Promise<Replay> {
        if (!loggedInUser) {
            throw new UnauthorizedException('Please log in to delete replays.');
        }

        const replay = await this.replaysService.findById(replayId);

        if (!replay) {
            throw new NotFoundException(`Replay not found with replay ID: ${replayId}`);
        }

        if (replay.user.webId !== loggedInUser.webId) {
            throw new UnauthorizedException(`You are not authorized to delete replay with ID: ${replayId}`);
        }

        await this.replaysService.deleteReplay(replay);

        return replay;
    }

    @ApiOperation({
        summary: 'TODO: Implement artefact fetching',
    })
    @Get(':replayId/file')
    async s3Test(
        @Param('replayId') replayId: string,
        // @Res() res: Response,
    ): Promise<StreamableFile> {
        // ) {
        const replay = await this.replaysService.findById(replayId);

        if (!replay) {
            throw new NotFoundException(`Replay not found with ID: ${replayId}`);
        }

        const buffer = await this.artefactsService.getReplayObject(replay);

        if (buffer === null) {
            throw new NotFoundException('Unable to fetch replay file buffer');
        }

        return new StreamableFile(
            buffer,
            { disposition: `attachment; filename=${replayId}` },
        );
    }
}
