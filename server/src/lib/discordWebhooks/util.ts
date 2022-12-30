import axios from 'axios';
import { Request } from 'express';

export enum WebhookType {
    INTERNAL = 'INTERNAL',
    PUBLIC = 'PUBLIC',
}

// Executes a webhook request with error handling, to the specified webhook, with the specified body
export const sendWebhookPayload = async (req: Request, webhookType: WebhookType, body: any) => {
    const webhookUrl = webhookType === WebhookType.INTERNAL
        ? process.env.INTERNAL_DISCORD_WEBHOOK_URL
        : process.env.INTERNAL_DISCORD_WEBHOOK_URL; // TODO: add public discord webhook url

    if (!webhookUrl) {
        req.log.error(`Failed to send payload to ${webhookType} discord webhook: No webhook url defined`);
        return;
    }

    await axios
        .post(webhookUrl, body)
        .catch((err: any) => {
            req.log.error('Failed to send payload to internal discord webhook:');
            req.log.error(body);
            req.log.error(err);
        });
};
