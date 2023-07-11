import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscordWebhookModule } from '../common/modules/discord/discord-webhook.module';
import { ReplaysModule } from '../replays/replays.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UserCreatedListener } from './listeners/user-created.listener';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        ReplaysModule,
        SessionsModule,
        DiscordWebhookModule,
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        UserCreatedListener,
    ],
    exports: [UsersService],
})
export class UsersModule { }
