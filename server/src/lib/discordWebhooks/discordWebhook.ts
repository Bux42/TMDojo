import { RequestLogger } from '../logger';
import { sendWebhookPayload, WebhookType } from './util';

export namespace DiscordWebhook {
    export const sendNewUserAlert = async (log: RequestLogger, name: string) => {
        const webhookType = WebhookType.INTERNAL;

        log.debug(`DiscordWebhook: Sending ${webhookType} discord alert for new user: ${name}`);

        const body = {
            embeds: [{
                author: {
                    name: 'New user!',
                    icon_url: 'https://i.imgur.com/ubkzobI.jpg',
                },
                title: name,
                color: '11964344', // hex color -> integer
            }],
        };

        await sendWebhookPayload(log, webhookType, body);
    };
}
