import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
    Billboard, Sphere, Text, Plane,
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
    Slider, InputNumber, Row, Col, Button,
} from 'antd';
import { ReplayData } from '../../lib/api/apiRequests';
import { getRaceTimeStr, timeDifference } from '../../lib/utils/time';

export class TimeLineInfos {
    currentRaceTime: number;
    followedReplay: any;
    constructor() {
        this.currentRaceTime = 0;
        this.followedReplay = null;
    }
}

interface TimeLineViewProps {
    replaysData: ReplayData[];
    timeLineGlobal: TimeLineInfos;
}

// declare setInterval return variable outside to keep persistent reference for clearInterval after render
let playInterval: any;

const TimeLineView = ({ replaysData, timeLineGlobal }: TimeLineViewProps) => {
    const [timeLineTime, setTimeLineTime] = useState<number>(0);
    const [sampleInterval, setSampleInterval] = useState<number>(7);
    const [playing, setPlaying] = useState<boolean>(false);

    const min = 0;
    let max = 0;

    if (timeLineGlobal.followedReplay !== null) {
        if (!replaysData.some((replay: ReplayData) => replay._id === timeLineGlobal.followedReplay._id)) {
            // eslint-disable-next-line no-param-reassign
            timeLineGlobal.followedReplay = null;
        }
    }

    if (replaysData.length === 0) {
        if (timeLineTime !== 0) {
            // eslint-disable-next-line no-param-reassign
            timeLineGlobal.currentRaceTime = 0;
            setTimeLineTime(0);
        }
        if (playing) {
            setPlaying(false);
        }
    }

    // eslint-disable-next-line no-param-reassign
    timeLineGlobal.currentRaceTime = timeLineTime;

    replaysData.forEach((replay) => {
        if (replay.samples[replay.samples.length - 1].currentRaceTime > max) {
            max = replay.samples[replay.samples.length - 1].currentRaceTime;
        }
    });

    const onChange = (e: any) => {
        setTimeLineTime(Math.round(e));
        // eslint-disable-next-line no-param-reassign
        timeLineGlobal.currentRaceTime = Math.round(e);
    };

    const onClick = () => {
        setPlaying(!playing);
        if (playing) {
            onChange(timeLineGlobal.currentRaceTime - 1);
            clearInterval(playInterval);
        } else {
            playInterval = setInterval(() => {
                if (timeLineGlobal.currentRaceTime + sampleInterval > max) {
                    onChange(min);
                } else {
                    onChange(timeLineGlobal.currentRaceTime + sampleInterval);
                }
            }, 0);
        }
    };

    const onChangeInterval = (e: number) => {
        setSampleInterval(e);
        if (playing) {
            clearInterval(playInterval);
            playInterval = setInterval(() => {
                if (timeLineGlobal.currentRaceTime + sampleInterval > max) {
                    onChange(min);
                } else {
                    onChange(timeLineGlobal.currentRaceTime + sampleInterval);
                }
            }, 0);
        }
    };

    const timeFormat = (v: any) => `${getRaceTimeStr(Math.round(v))}`;

    return (
        <>
            {replaysData.length > 0
        && (
            <Row className="absolute bottom-0 w-full z-10" style={{ backgroundColor: 'rgba(20,20,20,0.5)' }}>
                <Col span={12}>
                    <Slider
                        min={min}
                        max={max}
                        onChange={onChange}
                        value={typeof timeLineTime === 'number' ? timeLineTime : 0}
                        step={0.01}
                        tipFormatter={timeFormat}
                    />
                </Col>
                <Col span={3}>
                    <InputNumber
                        min={min}
                        max={max}
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
                        onClick={onClick}
                    >
                        {playing ? 'Pause' : 'Play'}
                    </Button>
                </Col>
                <Col span={2} className="m-1">
                    Speed
                    {' '}
                    {sampleInterval}
                </Col>
                <Col span={3}>
                    <Slider
                        min={1}
                        max={20}
                        onChange={onChangeInterval}
                        value={sampleInterval}
                        step={1}
                    />
                </Col>
            </Row>
        )}
        </>
    );
};

interface TimeLineProps {
    replaysData: ReplayData[];
    timeLineGlobal: any;
}

export const TimeLine = ({
    replaysData,
    timeLineGlobal,
}: TimeLineProps): JSX.Element => (
    <>
        <TimeLineView key="timeLine" replaysData={replaysData} timeLineGlobal={timeLineGlobal} />
    </>
);
