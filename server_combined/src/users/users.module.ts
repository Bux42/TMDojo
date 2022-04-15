import { Module } from '@nestjs/common';
import { ReplaysService } from '../replays/replays.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [],
    controllers: [UsersController],
    providers: [UsersService, ReplaysService],
    exports: [UsersService],
})
export class UsersModule {}
