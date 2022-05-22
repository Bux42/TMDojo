/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
    CaretRightOutlined, ClockCircleOutlined, ClockCircleTwoTone, EyeOutlined,
} from '@ant-design/icons';
import {
    Drawer, Row, Col, Radio, RadioChangeEvent, List, Divider, InputNumber,
} from 'antd';
import React, {
    useContext, useMemo, useState,
} from 'react';
import * as ReactColor from 'react-color';
import * as THREE from 'three';
import { ReplayData } from '../../lib/api/apiRequests';
import { CameraMode, SettingsContext } from '../../lib/contexts/SettingsContext';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';
import { addPlural, getRaceTimeStr } from '../../lib/utils/time';
import SideDrawerExpandButton from '../common/SideDrawerExpandButton';

interface LoadedReplayProps {
    replay: ReplayData;
    followed: ReplayData | undefined;
    followedReplayChanged: (replay: ReplayData | undefined) => void;
    hoveredReplayChanged: (replay: ReplayData | undefined) => void;
}

interface LoadedReplaysProps {
    replays: ReplayData[];
}

const LoadedReplay = ({
    replay, followed, followedReplayChanged, hoveredReplayChanged,
}: LoadedReplayProps): JSX.Element => {
    const [color, setColor] = useState(`#${replay.color.getHexString()}`);
    const [offsetTime, setOffsetTime] = useState<number>(replay.offsetTime);
    const [showOffsetTime, setShowOffsetTime] = useState<boolean>(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const { numColorChange, setNumColorChange } = useContext(SettingsContext);

    const onClick = () => {
        if (followed && followed._id === replay._id) {
            followedReplayChanged(undefined);
        } else {
            followedReplayChanged(replay);
        }
    };

    const handleChange = (c: any) => {
        setColor(c.hex);
    };

    const handleClose = () => {
        setShowColorPicker(false);
        replay.color = new THREE.Color(color);
        setNumColorChange(numColorChange + 1);
    };

    const toggleColorPicker = () => {
        setShowColorPicker(!showColorPicker);
    };

    const updateTimeOffset = (value: number) => {
        setOffsetTime(value);
        replay.offsetTime = value;
    };

    return (
        <>
            <Row
                style={{ width: 312 }}
                className="flex flex-row items-center select-none"
            >
                <Col
                    span="3"
                    className="cursor-pointer"
                    onClick={onClick}
                    onPointerEnter={() => hoveredReplayChanged(replay)}
                    onPointerLeave={() => hoveredReplayChanged(undefined)}
                >
                    <div className="flex items-center justify-center">
                        <EyeOutlined
                            style={
                                {
                                    verticalAlign: '',
                                    opacity: followed?._id === replay._id ? 1 : 0.5,
                                    color: followed?._id === replay._id ? '#0084ff' : 'gray',
                                    fontSize: '18px',
                                }
                            }
                        />
                    </div>
                </Col>
                <Col span="14">
                    <div className="flex flex-row items-center gap-3">
                        <div
                            style={{
                                background: '#333333',
                                borderRadius: '1px',
                                boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                                display: 'inline-block',
                                cursor: 'pointer',
                            }}
                            onClick={toggleColorPicker}
                            onPointerEnter={() => hoveredReplayChanged(replay)}
                            onPointerLeave={() => hoveredReplayChanged(undefined)}
                        >
                            <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '2px',
                                background: color,
                            }}
                            />
                        </div>
                        {showColorPicker ? (
                            <div style={{
                                position: 'absolute',
                                zIndex: 2,
                            }}
                            >
                                <div
                                    style={{
                                        position: 'fixed',
                                        top: '0px',
                                        right: '0px',
                                        bottom: '0px',
                                        left: '0px',
                                    }}
                                    onClick={handleClose}
                                >
                                    <ReactColor.ChromePicker
                                        disableAlpha
                                        color={color}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        ) : null}
                        <div
                            style={{
                                color: `#${replay.color.getHexString()}`,
                            }}
                            className="cursor-pointer flex-grow"
                            onClick={onClick}
                            onPointerEnter={() => hoveredReplayChanged(replay)}
                            onPointerLeave={() => hoveredReplayChanged(undefined)}
                        >
                            {replay.playerName}
                        </div>
                    </div>
                </Col>
                <Col
                    span="6"
                    className="cursor-pointer"
                    onClick={onClick}
                    onPointerEnter={() => hoveredReplayChanged(replay)}
                    onPointerLeave={() => hoveredReplayChanged(undefined)}
                >
                    {getRaceTimeStr(replay.endRaceTime)}
                </Col>
                <Col
                    span="1"
                    className="cursor-pointer"
                    onClick={() => setShowOffsetTime(!showOffsetTime)}
                >
                    {offsetTime === 0 && !showOffsetTime ? <ClockCircleOutlined /> : <ClockCircleTwoTone />}
                </Col>
                {showOffsetTime && (
                    <Row justify="space-between" className="w-full pt-1">
                        <Col className="self-center" span={10}>
                            <div>Offset Time:</div>
                        </Col>
                        <Col span={10}>
                            <InputNumber
                                className="w-full"
                                value={offsetTime}
                                defaultValue={3}
                                onChange={updateTimeOffset}
                            />
                        </Col>
                    </Row>
                )}
            </Row>

        </>

    );
};

const LoadedReplays = ({
    replays,
}: LoadedReplaysProps): JSX.Element => {
    const [visible, setVisible] = useState(true);
    const [followed, setFollowed] = useState<ReplayData>();
    const [hovered, setHovered] = useState<ReplayData>();

    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    const toggleSidebar = () => {
        setVisible(!visible);
    };

    const onClose = () => {
        setVisible(false);
    };

    const followedReplayChanged = (replay: ReplayData | undefined) => {
        setFollowed(replay);
    };
    const hoveredReplayChanged = (replay: ReplayData | undefined) => {
        setHovered(replay);
    };

    timeLineGlobal.followedReplay = followed;
    timeLineGlobal.hoveredReplay = hovered;

    const sortedReplays = useMemo(() => replays.sort((a, b) => a.endRaceTime - b.endRaceTime), [replays]);

    return (
        <div className="absolute right-0 z-10 mt-56">
            {!visible && (
                <SideDrawerExpandButton
                    onClick={toggleSidebar}
                    side="right"
                    content={(
                        <>
                            {`${replays.length} Replay${addPlural(replays.length)}`}
                        </>
                    )}
                />
            )}
            <Drawer
                style={{ height: 500, opacity: 0.9, marginTop: 296 }}
                mask={false}
                closeIcon={<CaretRightOutlined />}
                title={`${replays.length} Loaded Replays`}
                placement="right"
                width={360}
                onClose={onClose}
                visible={visible}
                headerStyle={{
                    backgroundColor: '#2C2C2C',
                }}
                bodyStyle={{
                    backgroundColor: '#1F1F1F',
                }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="text-base">Camera</div>
                    <Radio.Group
                        defaultValue={timeLineGlobal.cameraMode}
                        buttonStyle="solid"
                        onChange={(e: RadioChangeEvent) => { timeLineGlobal.cameraMode = e.target.value; }}
                        className="flex gap-4"
                    >
                        <Radio.Button value={CameraMode.Target}>
                            Target
                        </Radio.Button>
                        <Radio.Button value={CameraMode.Follow}>
                            Follow
                        </Radio.Button>
                    </Radio.Group>
                </div>
                <Divider className="mt-6 mb-0" />
                <List
                    dataSource={sortedReplays}
                    renderItem={(item) => (
                        <List.Item key={item._id}>
                            <LoadedReplay
                                replay={item}
                                followed={followed}
                                followedReplayChanged={followedReplayChanged}
                                hoveredReplayChanged={hoveredReplayChanged}
                            />
                        </List.Item>
                    )}
                />
            </Drawer>
        </div>
    );
};

export default LoadedReplays;
