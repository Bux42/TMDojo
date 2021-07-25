/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */
import React, { useState } from 'react';
import {
    Button,
    Card,
} from 'antd';
import Link from 'next/link';
import DiscordButton from '../common/DiscordButton';
import generateAuthUrl from '../../lib/api/auth';

type InfoTab = 'welcome'|'howDoesThisWork'|'getInvolved';

const InfoCard = (): JSX.Element => {
    const [infoTab, setInfoTab] = useState<InfoTab>('welcome');
    const tabList = [
        {
            key: 'login',
            tab: 'Login',
        },
        {
            key: 'welcome',
            tab: 'What\'s this?',
        },
        {
            key: 'howDoIUseThis',
            tab: 'How do I use this?',
        },
        {
            key: 'howDoesThisWork',
            tab: 'How does it work?',
        },
        {
            key: 'getInvolved',
            tab: 'Get involved!',
        },
    ];

    const LoginButton = () => (
        <Link href={generateAuthUrl('tmdojo')}>
            <Button key="tm.io" type="primary">
                Login with Ubisoft
            </Button>
        </Link>
    );

    const loginText = [
        'In order to have manage your replays, authenticate with your Ubisoft account.',
        '',
        <LoginButton />,
    ];
    const welcomeText = [
        'This is TMDojo - our platform to analyze Trackmania runs!',
        '',
        'Have you ever wondered how the WR drove that insane first turn?',
        'Ever been confused because you just can\'t figure out that one dirt gear?',
        '',
        'We want to give you the tools to really understand your replays - with a 3D view of the map and a ton of data!',
    ];
    const howDoIUseThisText = [
        'Simply pick a map from the table and open it.',
        '',
        'In the map view, open the replay menu on the left and load the replays you want to inspect.',
        'Now you can change the display settings to different modes using the menu on the right.',
        '',
        'To navigate around the 3D view, use right mouse button to move and left to rotate - scroll wheel zooms in and out.',
    ];
    const howDoesThisWorkText = [
        'We\'re planning on supporting several ways for you to submit runs:',
        '1. If you\'re using Openplanet, you can use our plugin to automatically upload your runs - only your PBs if you want.',
        '2. You can also upload a replay yourself, and we\'ll extract all the useful data.',
        '3. To make it even easier, we might also support fetching a time straight off the leaderboards - so you don\'t have to download it yourself.',
        '',
        'At the moment we\'re not ready for everyone\'s runs yet.',
        'If you\'re interested in testing stuff for us in the future, check out \'Get involved\'!',
    ];
    const getInvolvedText = [
        'TMDojo is still very much in development!',
        '',
        'We\'re working on it in our free time, so updates will come when they\'re ready.',
        '',
        <span>
            <span>In the meantime, feel free to join our </span>
            <DiscordButton />
            <span> and let us know what you think!</span>
        </span>,
    ];

    const transformTextToDOM = (textArray: (string | JSX.Element)[]) => textArray.map(
        (text:string|JSX.Element, i:number) => <p key={`${text}_${i}`}>{text === '' ? <br /> : text}</p>,
    );

    const tabContent = {
        login: (
            <div>{transformTextToDOM(loginText)}</div>
        ),
        welcome: (
            <div>{transformTextToDOM(welcomeText)}</div>
        ),
        howDoIUseThis: (
            <div>{transformTextToDOM(howDoIUseThisText)}</div>
        ),
        howDoesThisWork: (
            <div>{transformTextToDOM(howDoesThisWorkText)}</div>
        ),
        getInvolved: (
            <div>{transformTextToDOM(getInvolvedText)}</div>
        ),
    };

    return (
        <Card
            className="w-full dojo-info-card"
            title="Welcome to TMDojo!"
            tabList={tabList}
            activeTabKey={infoTab}
            onTabChange={(key) => {
                setInfoTab(key as InfoTab);
            }}
        >
            {tabContent[infoTab]}
        </Card>
    );
};

export default InfoCard;
