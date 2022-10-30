/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */
import Link from 'next/link';
import React, { useState } from 'react';
import CleanButton from '../common/CleanButton';

type Tab = 'whatIsThis' | 'howDoIRecord' | 'whereDoIAnalyze';

const ExplanationInfo = (): JSX.Element => {
    const [infoTab, setInfoTab] = useState<Tab>('whatIsThis');
    interface TabItem {
        key: Tab,
        title: string
    }
    const tabList: TabItem[] = [
        {
            key: 'whatIsThis',
            title: 'What is this?',
        },
        {
            key: 'howDoIRecord',
            title: 'How do I record?',
        },
        {
            key: 'whereDoIAnalyze',
            title: 'How do I analyze?',
        },
    ];

    const whatIsThis = [
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
    const howDoIRecord = [
        <div className="w-full text-base text-center font-bold">
            TMDojo Openplanet plugin
        </div>,
        '',
        <span>
            {'You can record your runs using the '}
            <Link href="https://openplanet.dev/plugin/tmdojo">
                <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://openplanet.dev/plugin/tmdojo"
                    className="underline hover:underline"
                >
                    TMDojo plugin
                </a>
            </Link>
            {' for Openplanet by installing it through the plugin manager.'}
        </span>,
        '',
        'We\'re planning on supporting several ways for you to submit runs:',
        '1. If you\'re using Openplanet, you can use our plugin to automatically upload your runs while playing.',
        '2. Later, you\'ll be able to upload a replay file yourself, and we\'ll extract all the useful data.',
        '3. To make it even easier, we might also support fetching a time straight off the leaderboards - so you don\'t have to download it yourself.',
    ];
    const whereDoIAnalyze = [
        'This website is the main hub for all your analysis - simply click a map to open the 3D viewer for that map.',
        'You will be able to load replays, adjust settings, follow replays, and view graphs of various recorded data points of the replays.',
        '',
        'If you want to see some more global statistics about replays on a certain map, check out the statistics page of a map by clicking the Stats button. This will show you various aggregate statistics about all replays for this map.',
        'And if you are logged in with your Ubisoft account, you will see more personalized statistics, like your personal best progression.',
    ];

    const transformTextToDOM = (textArray: (string | JSX.Element)[]) => textArray.map(
        (text: string | JSX.Element, i: number) => <p key={`${text}_${i}`}>{text === '' ? <br /> : text}</p>,
    );

    const tabContent = {
        whatIsThis: (
            <div>{transformTextToDOM(whatIsThis)}</div>
        ),
        howDoIRecord: (
            <div>{transformTextToDOM(howDoIRecord)}</div>
        ),
        whereDoIAnalyze: (
            <div>{transformTextToDOM(whereDoIAnalyze)}</div>
        ),
    };

    return (
        <>
            <div className="w-full flex justify-center gap-4 md:gap-12 text-md lg:text-lg font-bold">
                {tabList.map(({ key, title }) => (
                    <div
                        key={key}
                        style={{
                            backgroundColor: key === infoTab ? '#171717' : '#1F1F1F',
                            transition: 'all 0.15s ease-out',
                            transform: key === infoTab ? 'translate(0px, 4px)' : '',
                            width: `${100 / (tabList.length + 1)}%`,
                        }}
                        className={`flex items-center justify-center py-2 px-4 rounded-md cursor-pointer select-none text-center ${key === infoTab ? 'shadow' : ''}`}
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
