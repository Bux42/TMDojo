import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReplaysService } from '../replays/replays.service';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
         private readonly replaysService: ReplaysService,
    ) {}

    @Get(':webId/info')
    getUserInfo(@Param('webId') webId: string): string {
        return this.usersService.getUserInfoByWebId(webId);
    }

    // TODO: Remove this endpoint and adjust /replays to accept userWebId as filter
    @Get(':webId/replays')
    getUserReplays(@Param('webId') webId: string): string[] {
        return this.replaysService.getUserReplaysByWebId(webId);
    }
}
