import { config } from 'dotenv';

// Load dotenv config just in case
config();

export interface DiscordWebhook {
    url: string;
    name: string;
}

export const DISCORD_WEBHOOKS = {
    INTERNAL: {
        url: process.env.INTERNAL_DISCORD_WEBHOOK_URL,
        name: 'Internal',
    } as DiscordWebhook,
    TESTING: {
        url: process.env.INTERNAL_DISCORD_WEBHOOK_URL_TESTING,
        name: 'Testing',
    } as DiscordWebhook,
} as const;
