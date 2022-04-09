import axios from 'axios';
import { RequestLogger } from '../logger';

export enum WebhookType {
    INTERNAL = 'INTERNAL',
    PUBLIC = 'PUBLIC',
}

// Executes a webhook request with error handling, to the specified webhook, with the specified body
export const sendWebhookPayload = async (log: RequestLogger, webhookType: WebhookType, body: any) => {
    const webhookUrl = webhookType === WebhookType.INTERNAL
        ? process.env.INTERNAL_DISCORD_WEBHOOK_URL
        : process.env.INTERNAL_DISCORD_WEBHOOK_URL; // TODO: add public discord webhook url

    await axios
        .post(webhookUrl, body)
        .catch((err: any) => {
            log.error('Failed to send payload to internal discord webhook:');
            log.error(body);
            log.error(err);
        });
};
