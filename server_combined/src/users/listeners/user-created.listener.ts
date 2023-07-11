import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MyLogger } from '../../common/logger/my-logger.service';
import { DiscordWebhookService } from '../../common/modules/discord/discord.webhook.service';
import { UserCreatedEvent } from '../events/new-user.event';
import { UsersService } from '../users.service';

@Injectable()
export class UserCreatedListener {
    constructor(
        private usersService: UsersService,
        private discordWebhookService: DiscordWebhookService,
        private logger: MyLogger,
    ) {
        this.logger.setContext(UserCreatedListener.name);
    }

    @OnEvent(UserCreatedEvent.KEY)
    async handleUserCreatedEvent(event: UserCreatedEvent) {
        const { user } = event;

        this.logger.log('New event: User created!');

        // Send new user webhook alert
        const totalNumUsers = await this.usersService.count();
        this.discordWebhookService.sendNewUserAlert(user, totalNumUsers);
    }
}
