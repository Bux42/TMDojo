import {
    Controller, Get, NotFoundException, Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReplaysService } from '../replays/replays.service';
import { SessionsService } from '../sessions/sessions.service';
import { UserRo } from './dto/user.ro';
import { UserReplaysRo } from './ro/UserReplays.ro';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly replaysService: ReplaysService,
        private readonly sessionsService: SessionsService,
    ) { }

    @ApiOperation({
        summary: 'TODO: Remove',
    })
    @Get()
    async findAll(): Promise<UserRo[]> {
        const users = await this.usersService.findAll()
        return users.map((user: User) => user.toRo());
    }

    @ApiOperation({
        summary: 'TODO: Check functionality and return types',
    })
    @Get([':webId', ':webId/info'])
    async findOne(@Param('webId') webId: string): Promise<UserRo> {
        const user = await this.usersService.findByWebId(webId);

        if (user === null) {
            throw new NotFoundException(`User not found by webId: ${webId}`);
        }

        return user.toRo();
    }

    // TODO: Remove this endpoint and adjust 'GET /replays' to accept userWebId as filter
    @ApiOperation({
        summary: 'TODO: return type and remove and use \'/replays\' with webId as filter',
    })
    @Get(':webId/replays')
    async getUserReplays(@Param('webId') webId: string): Promise<UserReplaysRo> {
        const replays = await this.replaysService.findReplaysFromUser(webId);

        // TODO: Map replays to ReplayRo when implemented
        return {
            replays,
            totalResults: replays.length,
        };
    }

    // TODO: Remove endpoint after auth guards are implemented, only used for session testing
    @ApiOperation({
        summary: 'TODO: Remove endpoint after auth guards are implemented',
    })
    @Get('session/:sessionId')
    async getUserSession(@Param('sessionId') sessionId: string): Promise<UserRo> {
        const user = await this.sessionsService.findUserBySessionId(sessionId);

        if (user === null) {
            throw new NotFoundException(`Session not found by ID: ${sessionId}`);
        }

        return user.toRo();
    }
}
