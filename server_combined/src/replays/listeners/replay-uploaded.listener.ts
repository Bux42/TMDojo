import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MyLogger } from '../../common/logger/my-logger.service';
import { DiscordWebhookService } from '../../common/modules/discord/discord.webhook.service';
import { ReplayUploadedEvent } from '../events/replay-uploaded.event';
import { ReplaysService } from '../replays.service';

@Injectable()
export class ReplayUploadedListener {
    constructor(
        private replaysService: ReplaysService,
        private discordWebhookService: DiscordWebhookService,
        private logger: MyLogger,
    ) {
        this.logger.setContext(ReplayUploadedListener.name);
    }

    @OnEvent(ReplayUploadedEvent.KEY)
    async handleReplayUploadedEvent(event: ReplayUploadedEvent) {
        const { replay, user, map } = event;

        this.logger.log('New event: Replay uploaded!');

        const numReplays = await this.replaysService.countReplays();
        this.logger.log(`Replay #${numReplays} in total`);

        const numReplaysOfUser = await this.replaysService.countReplays({ userRef: user._id });
        this.logger.log(`Replay #${numReplaysOfUser} of user: ${user.playerName} (${user.webId})`);

        const numReplaysOnMap = await this.replaysService.countReplays({ mapRef: replay.mapRef });
        this.logger.log(`Replay #${numReplaysOnMap} on map: ${map.mapName} (${map.mapUId})`);

        await this.discordWebhookService.sendNewReplayAlert(replay, user, map);

        const replaysOfUserOnMap = await this.replaysService.findAll({ mapUId: map.mapUId, userWebId: user.webId });
        if (replaysOfUserOnMap.length > 1) {
            const sortedReplays = replaysOfUserOnMap.sort((a, b) => a.endRaceTime > b.endRaceTime ? 1 : -1);
            this.logger.debug(sortedReplays);
            const curBest = sortedReplays[0];
            const prevBest = sortedReplays[1];
            if (curBest.endRaceTime === replay.endRaceTime && curBest._id !== replay._id) {
                await this.discordWebhookService.sendNewPersonalBestAlert(curBest, prevBest, user, map);
            }
        }
    }
}
