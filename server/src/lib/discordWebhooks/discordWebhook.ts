import { Request } from 'express';
import { sendWebhookPayload, WebhookType } from './util';

export namespace DiscordWebhook {
    export const sendNewUserAlert = async (req: Request, name: string) => {
        const webhookType = WebhookType.INTERNAL;

        req.log.debug(`DiscordWebhook: Sending ${webhookType} discord alert for new user: ${name}`);

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

        await sendWebhookPayload(req, webhookType, body);
    };
}
