import { useState } from 'react';
import { Slider } from 'antd';
import {
    CaretRightOutlined, PauseOutlined,
} from '@ant-design/icons';
import { ReplayData } from '../../../lib/api/apiRequests';
import { getRaceTimeStr } from '../../../lib/utils/time';
import GlobalTimeLineInfos from '../../../lib/singletons/timeLineInfos';
import TimelineSlider from './TimelineSlider';

interface TimeLineViewProps {
    replaysData: ReplayData[];
}

// declare setInterval return variable outside to keep persistent reference for clearInterval after render
let playInterval: ReturnType<typeof setTimeout>;
let expectedTime = Date.now();

const MIN_SPEED = -2;
const MAX_SPEED = 2;

const TimeLineView = ({ replaysData }: TimeLineViewProps) => {
    const [timeLineTime, setTimeLineTime] = useState<number>(0);
    const [timelineSpeed, setTimelineSpeed] = useState<number>(1);
    const [playing, setPlaying] = useState<boolean>(false);

    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    timeLineGlobal.maxRaceTime = 0;

    timeLineGlobal.isPlaying = playing;

    timeLineGlobal.currentRaceTime = timeLineTime;

    if (timeLineGlobal.followedReplay !== null) {
        if (!replaysData.some((replay: ReplayData) => replay._id === timeLineGlobal.followedReplay?._id)) {
            timeLineGlobal.followedReplay = undefined;
        }
    }

    if (replaysData.length === 0) {
        clearInterval(playInterval);
        if (timeLineTime !== 0) {
            timeLineGlobal.currentRaceTime = 0;
            setTimeLineTime(0);
        }
        if (playing) {
            setPlaying(false);
        }
    }

    replaysData.forEach((replay) => {
        if (replay.samples[replay.samples.length - 1].currentRaceTime > timeLineGlobal.maxRaceTime) {
            timeLineGlobal.maxRaceTime = replay.samples[replay.samples.length - 1].currentRaceTime;
        }
    });

    const onChange = (e: number) => {
        setTimeLineTime(Math.round(e));
    };

    // from: https://stackoverflow.com/a/29972322
    const startSteadyLoop = (callback: () => any) => {
        const dt = Date.now() - expectedTime; // the drift (positive for overshooting)

        if (dt > timeLineGlobal.tickTime) {
            // something really bad happened. Maybe the browser (tab) was inactive?
            // possibly special handling to avoid futile "catch up" run
        }

        // Perform actual code callback
        callback();

        expectedTime += timeLineGlobal.tickTime;

        // Stop timeout loop if you stop playing
        const timeToWait = Math.max(0, timeLineGlobal.tickTime - dt);
        playInterval = setTimeout(() => startSteadyLoop(callback), timeToWait); // take into account drift
    };

    const initInterval = (speed: number) => {
        expectedTime = Date.now() + timeLineGlobal.tickTime;

        const intervalCallback = () => {
            const raceTimeIncrement = timeLineGlobal.tickTime * speed;
            const nextRaceTime = timeLineGlobal.currentRaceTime + raceTimeIncrement;
            if (nextRaceTime > timeLineGlobal.maxRaceTime || nextRaceTime < 0) {
                // Loop time back to 0 if time is past the max
                //  and ensure time stays at least 0
                onChange(0);
            } else {
                onChange(nextRaceTime);
            }
        };

        playInterval = setTimeout(() => startSteadyLoop(intervalCallback), timeLineGlobal.tickTime);
    };

    const onTogglePlay = (shouldPlay: boolean = !playing) => {
        setPlaying(shouldPlay);
        if (!shouldPlay) {
            // was playing, pause interval
            onChange(timeLineGlobal.currentRaceTime);
            clearInterval(playInterval);
        } else {
            // was not playing, start playing
            initInterval(timelineSpeed);
        }
    };

    const onChangeSpeed = (speed: number) => {
        setTimelineSpeed(speed);
        if (playing) {
            clearInterval(playInterval);
            initInterval(speed);
        }
    };

    const timeFormat = (v: number | undefined) => (v !== undefined ? `${getRaceTimeStr(v)}` : '');

    return (
        <div
            className="absolute bottom-0 w-full h-14 py-1 px-4 border-t-2 select-none"
            style={{
                backgroundColor: '#1f1f1f',
                borderColor: '#333',
            }}
        >
            <div className="flex flex-row items-center gap-4 w-full h-full">
                <div className="flex-grow h-full py-3 items-center">
                    <TimelineSlider
                        onChange={onChange}
                        yDragMargin={20}
                    />
                </div>
                <div className="flex-grow-0 w-24 h-full py-2">
                    <div
                        className="flex w-full h-full items-center justify-center"
                        style={{ backgroundColor: '#2C2C2C' }}
                    >
                        {timeFormat(timeLineTime)}
                    </div>
                </div>
                <div
                    className="px-4 text-3xl cursor-pointer"
                    onClick={() => onTogglePlay()}
                    onKeyDown={() => onTogglePlay()}
                    role="button"
                    tabIndex={0}
                >
                    {playing
                        ? <PauseOutlined />
                        : <CaretRightOutlined />}
                </div>
                <div className="flex flex-col items-center justify-center">
                    <div className="text-xs">
                        {`Speed: ${timelineSpeed.toFixed(2)}x`}
                    </div>
                    <div className="flex flex-row items-center">
                        <div className="text-xs">
                            {MIN_SPEED}
                            x
                        </div>
                        <div className="px-1">
                            <Slider
                                style={{
                                    width: 150,
                                    padding: '2px',
                                    marginBottom: 0,
                                    marginTop: '8px',
                                }}
                                min={MIN_SPEED}
                                max={MAX_SPEED}
                                onChange={onChangeSpeed}
                                value={timelineSpeed}
                                step={0.1}
                                tooltipVisible={false}
                            />
                        </div>
                        <div className="text-xs">
                            {MAX_SPEED}
                            x
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TimeLineProps {
    replaysData: ReplayData[];
}

const TimeLine = ({
    replaysData,
}: TimeLineProps): JSX.Element => (
    <>
        <TimeLineView key="timeLine" replaysData={replaysData} />
    </>
);

export default TimeLine;
