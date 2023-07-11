import { MessageBuilder } from 'webhook-discord';

// Defines all the possible props that can be passed to the helper functions in 'webhook-discord's MessageBuilder class
export interface DiscordWebhookMsgParams {
    username?: string;
    avatarURL?: string;
    footer?: {
        footer: string;
        footerIcon: string;
    };
    description?: string;
    text?: string;
    field?: {
        title: string;
        value: string;
        inline?: boolean;
    }
    imageURL?: string;
    timestamp?: number;
    title?: string;
    author?: {
        author: string;
        iconURL?: string;
        url?: string;
    },
    url?: string;
    color?: string;
    thumbnailURL?: string;
}

export const createDiscWebhookMessage = (params: DiscordWebhookMsgParams) => {
    const msg = new MessageBuilder();

    if (params.avatarURL) {
        msg.setAvatar(params.avatarURL);
    }

    if (params.username) {
        msg.setName(params.username);
    }

    if (params.footer) {
        const { footer, footerIcon } = params.footer;
        msg.setFooter(footer, footerIcon);
    }

    if (params.description) {
        msg.setDescription(params.description);
    }

    if (params.text) {
        msg.setText(params.text);
    }

    if (params.field) {
        const { title, value, inline } = params.field;
        msg.addField(title, value, inline);
    }

    if (params.imageURL) {
        msg.setImage(params.imageURL);
    }

    if (params.timestamp) {
        msg.setTime(params.timestamp);
    }

    if (params.title) {
        msg.setTitle(params.title);
    }

    if (params.author) {
        const { author, iconURL, url } = params.author;
        msg.setAuthor(author, iconURL, url);
    }

    if (params.url) {
        msg.setURL(params.url);
    }

    if (params.color) {
        msg.setColor(params.color);
    }

    if (params.thumbnailURL) {
        msg.setThumbnail(params.thumbnailURL);
    }

    return msg;
};
