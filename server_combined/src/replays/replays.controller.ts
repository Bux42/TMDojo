import {
    Controller, Delete, Get, NotFoundException, Param, Post, Query, StreamableFile, UnauthorizedException,
} from '@nestjs/common';
import { Req, UseGuards } from '@nestjs/common/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ArtefactsService } from '../common/modules/artefacts/artefacts.service';
import { User } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MyLogger } from '../common/logger/my-logger.service';
import { UserRo } from '../users/dto/user.ro';
import { FindReplaysDto } from './dto/find-replays.dto';
import { UploadReplayDto } from './dto/upload-replay.dto';
import { ReplaysService } from './replays.service';
import { ReplayRo } from './dto/replay.ro';
import { FindReplaysRo } from './dto/find-replays.ro';
import { Replay } from './schemas/replay.schema';
import { streamToBuffer } from '../common/util/streams';

@ApiTags('replays')
@Controller('replays')
export class ReplaysController {
    constructor(
        private readonly replaysService: ReplaysService,
        private readonly artefactsService: ArtefactsService,
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(ReplaysController.name);
    }

    @ApiOperation({
        summary: 'TODO: Check functionality and return types',
    })
    @Get()
    async findAll(@Query() findReplayOptions: FindReplaysDto): Promise<FindReplaysRo> {
        const replays = await this.replaysService.findAll(findReplayOptions);

        return {
            replays: replays.map((replay: Replay) => replay.toRo()),
            totalResults: replays.length,
        };
    }

    @ApiOperation({
        summary: 'TODO: Check functionality and return types',
    })
    @Get(':replayId')
    async findOne(@Param('replayId') replayId: string): Promise<ReplayRo> {
        const replay = await this.replaysService.findById(replayId);

        if (!replay) {
            throw new NotFoundException(`Replay not found with replay ID: '${replayId}'`);
        }

        return replay.toRo();
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
    ): Promise<ReplayRo> {
        const rawReplayBuffer = await streamToBuffer(req);

        const replay = await this.replaysService.uploadReplay(loggedInUser, uploadReplayDto, rawReplayBuffer);

        return replay.toRo();
    }

    @ApiOperation({
        summary: 'TODO: Delete replay artefact (replay is being deleted from DB atm)',
    })
    @UseGuards(JwtAuthGuard)
    @Delete(':replayId')
    async delete(
        @User() loggedInUser: UserRo,
        @Param('replayId') replayId: string,
    ): Promise<ReplayRo> {
        if (!loggedInUser) {
            throw new UnauthorizedException('Please log in to delete replays.');
        }

        const replay = await this.replaysService.findById(replayId);

        if (!replay) {
            throw new NotFoundException(`Replay not found with replay ID: '${replayId}'`);
        }

        if (replay.user.webId !== loggedInUser.webId) {
            throw new UnauthorizedException(`You are not authorized to delete replay with ID: '${replayId}'`);
        }

        await this.replaysService.deleteReplay(replay);

        return replay.toRo();
    }

    @ApiOperation({
        summary: 'TODO: Implement artefact fetching',
    })
    @Get(':replayId/file')
    async s3Test(
        @Param('replayId') replayId: string,
    ): Promise<StreamableFile> {
        const replay = await this.replaysService.findById(replayId);

        if (!replay) {
            throw new NotFoundException(`Replay not found with ID: '${replayId}'`);
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
