import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplaysService } from './replays.service';
import { ReplaysController } from './replays.controller';
import { Replay, ReplaySchema } from './schemas/replay.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Replay.name, schema: ReplaySchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [ReplaysController],
    providers: [ReplaysService],
    exports: [ReplaysService],
})
export class ReplaysModule {}
