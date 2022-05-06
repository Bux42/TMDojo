import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplaysService } from './replays.service';
import { ReplaysController } from './replays.controller';
import { Replay, ReplaySchema } from './schemas/replay.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { S3Service } from '../artefacts/services/s3.service';
import { ArtefactsService } from '../artefacts/artefacts.service';
import { LocalArtefactsService } from '../artefacts/services/localArtefacts.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Replay.name, schema: ReplaySchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [ReplaysController],
    providers: [ReplaysService, ArtefactsService, S3Service, LocalArtefactsService],
    exports: [ReplaysService],
})
export class ReplaysModule {}
