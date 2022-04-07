import { Request } from 'express';
import { Collection, Document } from 'mongodb';
import { sendWebhookPayload, WebhookType } from './util';

export namespace DiscordWebhook {
    export const sendNewUserAlert = async (req: Request, name: string, usersCollection: Collection<Document>) => {
        try {
            const webhookType = WebhookType.INTERNAL;

            req.log.debug(`DiscordWebhook: Sending ${webhookType} discord alert for new user: ${name}`);

            // Perform count in webhook method to not block main response flow
            const numUsers = await usersCollection.countDocuments();

            const body = {
                embeds: [{
                    author: {
                        name: `New user! #${numUsers}`,
                        icon_url: 'https://i.imgur.com/ubkzobI.jpg',
                    },
                    title: name,
                    color: '11964344', // hex color -> integer
                }],
            };

            await sendWebhookPayload(req, webhookType, body);
        } catch (e) {
            req.log.error(`DiscordWebhook.sendNewUserAlert: Error sending new user alert: ${e}`);
        }
    };
}
