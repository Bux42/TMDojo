/* eslint-disable no-param-reassign */
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

let playInterval: any;
let playing = false;
let prevReplayCount: number = 0;
let prevFollowedReplay: any = null;

const TimeLineView = ({ replaysData, timeLineGlobal }: TimeLineViewProps) => {
    const [value, setValue] = useState<number>(0);
    const [sampleInterval, setSampleInterval] = useState<number>(7);

    const min = 0;
    let max = 0;

    if (timeLineGlobal.followedReplay !== null) {
        prevFollowedReplay = timeLineGlobal.followedReplay;
    } else if (prevFollowedReplay !== null && prevReplayCount !== replaysData.length) {
        if (replaysData.some((replay: ReplayData) => replay._id === prevFollowedReplay._id)) {
            timeLineGlobal.followedReplay = prevFollowedReplay;
        } else {
            prevFollowedReplay = null;
        }
    }

    if (replaysData.length === 0) {
        playing = false;
        clearInterval(playInterval);
    }

    if ((replaysData.length === 0 && prevReplayCount !== replaysData.length)) {
        prevReplayCount = replaysData.length;
        timeLineGlobal.currentRaceTime = 0;
        setValue(0);
    }

    timeLineGlobal.currentRaceTime = value;

    prevReplayCount = replaysData.length;

    replaysData.forEach((replay) => {
        if (replay.samples[replay.samples.length - 1].currentRaceTime > max) {
            max = replay.samples[replay.samples.length - 1].currentRaceTime;
        }
    });

    const onChange = (e: any) => {
        setValue(Math.round(e));
        timeLineGlobal.currentRaceTime = Math.round(e);
    };

    const onClick = () => {
        playing = !playing;
        if (!playing) {
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
                        value={typeof value === 'number' ? value : 0}
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
                        value={value}
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
