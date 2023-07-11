import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplaysService } from './replays.service';
import { ReplaysController } from './replays.controller';
import { Replay, ReplaySchema } from './schemas/replay.schema';
import { ArtefactsModule } from '../common/modules/artefacts/artefacts.module';
import { MapsModule } from '../maps/maps.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ReplayUploadedListener } from './listeners/replay-uploaded.listener';
import { DiscordWebhookModule } from '../common/modules/discord/discord-webhook.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Replay.name, schema: ReplaySchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        ArtefactsModule,
        MapsModule,
        DiscordWebhookModule,
    ],
    controllers: [ReplaysController],
    providers: [
        ReplaysService,
        ReplayUploadedListener,
    ],
    exports: [ReplaysService],
})
export class ReplaysModule { }
