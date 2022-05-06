import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplaysService } from '../replays/replays.service';
import { Replay, ReplaySchema } from '../replays/schemas/replay.schema';
import { Session, SessionSchema } from '../sessions/schemas/session.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Replay.name, schema: ReplaySchema }]),
        MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    ],
    controllers: [UsersController],
    providers: [UsersService, ReplaysService],
    exports: [UsersService],
})
export class UsersModule {}
