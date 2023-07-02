import {
    Controller, Get, NotFoundException, Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReplaysService } from '../replays/replays.service';
import { SessionsService } from '../sessions/sessions.service';
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
    async findAll(): Promise<User[]> {
        return this.usersService.findAll({ clientCode: 0 });
    }

    @ApiOperation({
        summary: 'TODO: Check functionality and return types',
    })
    @Get([':webId', ':webId/info'])
    async findOne(@Param('webId') webId: string): Promise<User> {
        const user = await this.usersService.findByWebId(
            webId,
            { clientCode: 0 },
        );

        if (user === null) {
            throw new NotFoundException(`User not found by webId: ${webId}`);
        }

        return user;
    }

    // TODO: Remove this endpoint and adjust 'GET /replays' to accept userWebId as filter
    @ApiOperation({
        summary: 'TODO: return type and remove and use \'/replays\' with webId as filter',
    })
    @Get(':webId/replays')
    async getUserReplays(@Param('webId') webId: string) {
        const replays = await this.replaysService.findReplaysFromUser(webId);

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
    async getUserSession(@Param('sessionId') sessionId: string): Promise<User> {
        const user = await this.sessionsService.findUserBySessionId(sessionId);

        if (user === null) {
            throw new NotFoundException(`Session not found by ID: ${sessionId}`);
        }

        return user;
    }
}
