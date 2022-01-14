/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */
import React, { useState } from 'react';
import DiscordButton from '../common/DiscordButton';

type Tab = 'whatIsTMDojo'|'howDoIUseIt'|'howDoesItWork';

const ExplanationInfo = (): JSX.Element => {
    const [infoTab, setInfoTab] = useState<Tab>('whatIsTMDojo');
    interface TabItem {
        key: Tab,
        title: string
    }
    const tabList: TabItem[] = [
        {
            key: 'whatIsTMDojo',
            title: 'What is TMDojo?',
        },
        {
            key: 'howDoIUseIt',
            title: 'How do I use it?',
        },
        {
            key: 'howDoesItWork',
            title: 'How does it work?',
        },
    ];

    const whatIsTMDojo = [
        <div className="w-full text-base text-center font-bold">
            This is TMDojo - our platform to analyze Trackmania runs!
        </div>,
        '',
        'Have you ever wondered how the WR drove that insane first turn, or just can’t figure out that one dirt gear?',
        'We want to give you the tools to really understand your replays - with a 3D view of the map and a ton of data!',
        '',
        'TMDojo uses an OpenPlanet plugin to record and upload your Trackmania runs.',
        '',
        'This website is the main hub for all your analysis - click a map to open a 3D viewer to analyze, compare, or simply admire your runs.',
        'Check the Stats page to view some statistics about all the replays that have been uploaded for a specific map!',
        '',
        'TMDojo is still in development, so new features will always be in the works...',
    ];
    const howDoIUseIt = [
        'Simply pick a map from the table and open it.',
        '',
        'In the map view, open the replay menu on the left and load the replays you want to inspect.',
        'Now you can change the display settings to different modes using the menu on the right.',
        '',
        'To navigate around the 3D view, use right mouse button to move and left to rotate - scroll wheel zooms in and out.',
    ];
    const howDoesItWork = [
        'We\'re planning on supporting several ways for you to submit runs:',
        '1. If you\'re using Openplanet, you can use our plugin to automatically upload your runs - only your PBs if you want.',
        '2. You can also upload a replay yourself, and we\'ll extract all the useful data.',
        '3. To make it even easier, we might also support fetching a time straight off the leaderboards - so you don\'t have to download it yourself.',
        '',
        'At the moment we\'re not ready for everyone\'s runs yet.',
        'If you\'re interested in testing stuff for us in the future, check out \'Get involved\'!',
    ];

    const transformTextToDOM = (textArray: (string | JSX.Element)[]) => textArray.map(
        (text:string|JSX.Element, i:number) => <p key={`${text}_${i}`}>{text === '' ? <br /> : text}</p>,
    );

    const tabContent = {
        whatIsTMDojo: (
            <div>{transformTextToDOM(whatIsTMDojo)}</div>
        ),
        howDoIUseIt: (
            <div>{transformTextToDOM(howDoIUseIt)}</div>
        ),
        howDoesItWork: (
            <div>{transformTextToDOM(howDoesItWork)}</div>
        ),
    };

    return (
        <>
            <div className="w-full flex justify-center gap-12 text-lg font-bold">
                {tabList.map(({ key, title }) => (
                    <div
                        id={key}
                        style={{
                            backgroundColor: key === infoTab ? '#171717' : '#1F1F1F',
                            transition: 'all 0.15s ease-out',
                            transform: key === infoTab ? 'translate(0px,2px)' : '',
                        }}
                        className={`py-2 px-4 rounded-md cursor-pointer select-none text-center ${key === infoTab ? 'shadow' : ''}`}
                        onClick={() => setInfoTab(key)}
                        role="button"
                        tabIndex={0}
                        aria-hidden
                    >
                        {title}
                    </div>
                ))}
            </div>
            {tabContent[infoTab]}
        </>
    );
};

export default ExplanationInfo;
