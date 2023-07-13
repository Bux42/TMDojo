import { Injectable } from '@nestjs/common';
import { Webhook } from 'webhook-discord';
import { Map } from '../../../maps/schemas/map.schema';
import { Replay } from '../../../replays/schemas/replay.schema';
import { UserRo } from '../../../users/dto/user.ro';
import { MyLogger } from '../../logger/my-logger.service';
import { formatRaceTime, formatRaceTimeDelta } from '../../util/raceTime/formatRaceTime';
import { getMedalFromRaceTime } from '../../util/raceTime/medals';
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

        const timeStr = formatRaceTime(replay.endRaceTime);
        const medal = getMedalFromRaceTime(replay.endRaceTime, map);
        const sectorsStr = replay.sectorTimes ? replay.sectorTimes.map((t) => formatRaceTime(t)).join(', ') : 'N/A';

        await this.sendWebhookMessage(webhook, {
            username: DOJO_BOT_NAME,
            title: `New replay from ${user.playerName}`,
            description:
                `Map: ${map.mapName}
                Time: ${timeStr}
                Medal: ${medal}
                Sectors: ${sectorsStr}`,
            color: '#B68FB8',
            thumbnailURL: map.thumbnailUrl,
        });
    };

    async sendNewPersonalBestAlert(replay: Replay, previousBestTime: Replay, user: UserRo, map: Map) {
        const webhook = DISCORD_WEBHOOKS.TESTING;

        this.logger.debug(`DiscordWebhook: Sending '${webhook.name}' discord alert for new personal best: ${user.playerName}`);

        const pbTimeStr = formatRaceTime(replay.endRaceTime);
        const prevPbTimeStr = formatRaceTime(previousBestTime.endRaceTime);
        const delta = replay.endRaceTime - previousBestTime.endRaceTime;
        const deltaStr = formatRaceTimeDelta(delta);
        const medal = getMedalFromRaceTime(replay.endRaceTime, map);

        await this.sendWebhookMessage(webhook, {
            username: DOJO_BOT_NAME,
            title: `New personal best from ${user.playerName}`,
            description:
                `Map: ${map.mapName}
                PB: ${pbTimeStr}
                Previous PB: ${prevPbTimeStr}
                Delta: ${deltaStr}
                Medal: ${medal}`,
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
    };
}
