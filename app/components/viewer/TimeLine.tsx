import { useState } from 'react';
import {
    Slider, InputNumber, Row, Col, Button,
} from 'antd';
import { ReplayData } from '../../lib/api/apiRequests';
import { getRaceTimeStr } from '../../lib/utils/time';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';

interface TimeLineViewProps {
    replaysData: ReplayData[];
}

// declare setInterval return variable outside to keep persistent reference for clearInterval after render
let playInterval: ReturnType<typeof setTimeout>;
let expectedTime = Date.now();
const TICK_TIME = 1000 / 60;

const TimeLineView = ({ replaysData }: TimeLineViewProps) => {
    const [timeLineTime, setTimeLineTime] = useState<number>(0);
    const [timelineSpeed, setTimelineSpeed] = useState<number>(1);
    const [playing, setPlaying] = useState<boolean>(false);

    const min = 0;

    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    timeLineGlobal.maxRaceTime = 0;

    timeLineGlobal.isPlaying = playing;

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

    timeLineGlobal.currentRaceTime = timeLineTime;

    replaysData.forEach((replay) => {
        if (replay.samples[replay.samples.length - 1].currentRaceTime > timeLineGlobal.maxRaceTime) {
            timeLineGlobal.maxRaceTime = replay.samples[replay.samples.length - 1].currentRaceTime;
        }
    });

    const onChange = (e: number) => {
        setTimeLineTime(Math.round(e));
        timeLineGlobal.currentRaceTime = Math.round(e);
    };

    // from: https://stackoverflow.com/a/29972322
    const startSteadyLoop = (callback: () => any) => {
        const dt = Date.now() - expectedTime; // the drift (positive for overshooting)

        if (dt > TICK_TIME) {
            // something really bad happened. Maybe the browser (tab) was inactive?
            // possibly special handling to avoid futile "catch up" run
        }

        // Perform actual code callback
        callback();

        expectedTime += TICK_TIME;

        // Stop timeout loop if you stop playing
        const timeToWait = Math.max(0, TICK_TIME - dt);
        playInterval = setTimeout(() => startSteadyLoop(callback), timeToWait); // take into account drift
    };

    const initInterval = (speed: number) => {
        expectedTime = Date.now() + TICK_TIME;

        const intervalCallback = () => {
            const raceTimeIncrement = TICK_TIME * speed;
            const nextRaceTime = timeLineGlobal.currentRaceTime + raceTimeIncrement;
            if (nextRaceTime > timeLineGlobal.maxRaceTime) {
                onChange(min);
            } else {
                onChange(nextRaceTime);
            }
        };

        playInterval = setTimeout(() => startSteadyLoop(intervalCallback), TICK_TIME);
    };

    const onTogglePlay = () => {
        setPlaying(!playing);
        if (playing) {
            // was playing, pause interval
            onChange(timeLineGlobal.currentRaceTime - 1);
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
        <>
            {replaysData.length > 0
        && (
            <Row className="absolute bottom-0 w-full z-10" style={{ backgroundColor: 'rgba(20,20,20,0.5)' }}>
                <Col span={12}>
                    <Slider
                        min={min}
                        max={timeLineGlobal.maxRaceTime}
                        onChange={onChange}
                        value={timeLineTime}
                        step={0.01}
                        tipFormatter={timeFormat}
                    />
                </Col>
                <Col span={3}>
                    <InputNumber
                        min={min}
                        max={timeLineGlobal.maxRaceTime}
                        style={{ margin: '0 16px' }}
                        step={0.01}
                        value={timeLineTime}
                        readOnly
                        formatter={timeFormat}
                    />
                </Col>
                <Col span={3}>
                    <Button
                        type="primary"
                        onClick={onTogglePlay}
                    >
                        {playing ? 'Pause' : 'Play'}
                    </Button>
                </Col>
                <Col span={2} className="m-1">
                    {`Speed: ${timelineSpeed}x`}
                </Col>
                <Col span={3}>
                    <Slider
                        min={0.25}
                        max={2}
                        onChange={onChangeSpeed}
                        value={timelineSpeed}
                        step={0.25}
                        tipFormatter={(value) => `${value}x`}
                    />
                </Col>
            </Row>
        )}
        </>
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
