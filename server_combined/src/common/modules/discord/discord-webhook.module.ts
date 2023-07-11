import { Module } from '@nestjs/common';
import { DiscordWebhookService } from './discord.webhook.service';

@Module({
    providers: [DiscordWebhookService],
    exports: [DiscordWebhookService],
})
export class DiscordWebhookModule { }
