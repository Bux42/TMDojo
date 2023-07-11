import { Injectable } from '@nestjs/common';
import { Webhook } from 'webhook-discord';
import { Map } from '../../../maps/schemas/map.schema';
import { Replay } from '../../../replays/schemas/replay.schema';
import { UserRo } from '../../../users/dto/user.ro';
import { MyLogger } from '../../logger/my-logger.service';
import { createDiscWebhookMessage, DiscordWebhookMsgParams } from './create-disc-webhook-message';
import { DiscordWebhook, DISCORD_WEBHOOKS } from './webhooks';

const DOJO_BOT_NAME = 'DojoBot';

@Injectable()
export class DiscordWebhookService {
    constructor(
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(DiscordWebhookService.name);
    }

    sendNewUserAlert = async (user: UserRo, numTotalUsers: number) => {
        const webhook = DISCORD_WEBHOOKS.TESTING;

        this.logger.debug(`DiscordWebhook: Sending ${webhook} discord alert for new user: ${user.playerName}`);

        await this.sendWebhookMessage(webhook, {
            username: DOJO_BOT_NAME,
            author: {
                author: `New user! #${numTotalUsers}`,
                iconURL: 'https://i.imgur.com/ubkzobI.jpg',
            },
            title: user.playerName,
            color: '#B68FB8',
        });
    };

    sendNewReplayAlert = async (replay: Replay, user: UserRo, map: Map) => {
        const webhook = DISCORD_WEBHOOKS.TESTING;

        this.logger.debug(`DiscordWebhook: Sending '${webhook.name}' discord alert for new replay: ${user.playerName}`);

        await this.sendWebhookMessage(webhook, {
            username: DOJO_BOT_NAME,
            title: `New replay from ${user.playerName}`,
            description: `Map: ${map.mapName}\nTime: ${replay.endRaceTime}\nPlugin version: ${replay.pluginVersion}`,
            color: '#B68FB8',
            thumbnailURL: map.thumbnailUrl,
        });
    }

    private sendWebhookMessage = async (webhook: DiscordWebhook, webhookMsgParams: DiscordWebhookMsgParams) => {
        this.logger.debug(`Sending message to discord webhook: ${webhook.name}`);

        const hook = new Webhook(webhook.url);

        const msg = createDiscWebhookMessage(webhookMsgParams);

        try {
            await hook.send(msg);
        } catch (e) {
            this.logger.error('Error sending discord webhook message:');
            this.logger.error(e);
        }
    }
}
