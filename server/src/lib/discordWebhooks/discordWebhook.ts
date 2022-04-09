import { Collection, Document } from 'mongodb';
import { RequestLogger } from '../logger';
import { sendWebhookPayload, WebhookType } from './util';

export namespace DiscordWebhook {
    export const sendNewUserAlert = async (log: RequestLogger, name: string, usersCollection: Collection<Document>) => {
        try {
            const webhookType = WebhookType.INTERNAL;

            log.debug(`DiscordWebhook: Sending ${webhookType} discord alert for new user: ${name}`);

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

            await sendWebhookPayload(log, webhookType, body);
        } catch (e) {
            log.error(`DiscordWebhook.sendNewUserAlert: Error sending new user alert: ${e}`);
        }
    };
}
