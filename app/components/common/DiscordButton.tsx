/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Link from 'next/link';
import Icon from '@ant-design/icons';
import {
    Button,
} from 'antd';

import DiscordSVG from '../../assets/discord.svg';

const DiscordIcon = (props:any): JSX.Element => (
    <Icon
        component={DiscordSVG}
        {...props}
    />
);

const DISCORD_URL = 'https://discord.gg/RPbZHvxNRG';

const DiscordButton = (): JSX.Element => (
    <Link href={DISCORD_URL}>
        <a target="_blank" rel="noreferrer" href={DISCORD_URL}>
            <Button
                style={{ borderColor: '#5865f2aa', color: '#5865f2', fontWeight: 500 }}
                size="small"
                icon={<DiscordIcon />}
                className="inline-flex items-center dojo-discord-button"
            >
                Discord
            </Button>
        </a>
    </Link>

);

export default DiscordButton;
