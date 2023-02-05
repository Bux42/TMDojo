import {
    Controller, Get, NotFoundException, Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReplaysService } from '../replays/replays.service';
import { Replay } from '../replays/schemas/replay.schema';
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

    @Get()
    async getUsers(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get([':webId', ':webId/info'])
    async getUserInfo(@Param('webId') webId: string): Promise<User> {
        const user = await this.usersService.findUserByWebId(webId);

        if (user === null) {
            throw new NotFoundException(`User with webId not found: ${webId}`);
        }

        return user;
    }

    // TODO: Remove this endpoint and adjust 'GET /replays' to accept userWebId as filter
    @Get(':webId/replays')
    getUserReplays(@Param('webId') webId: string): Promise<Replay[]> {
        return this.replaysService.findUserReplaysByWebId(webId);
    }

    // TODO: Remove endpoint after auth guards are implemented, only used for session testing
    @Get('session/:sessionId')
    async getUserSession(@Param('sessionId') sessionId: string): Promise<User> {
        const user = await this.sessionsService.findUserBySessionId(sessionId);

        if (user === null) {
            throw new NotFoundException(`Session with ID not found: ${sessionId}`);
        }

        return user;
    }
}
