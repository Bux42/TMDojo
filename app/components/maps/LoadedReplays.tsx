/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
    CaretLeftOutlined, CaretRightOutlined, EyeOutlined, LeftCircleFilled,
} from '@ant-design/icons';
import {
    Button, Checkbox, Drawer, Select, Row, Col, Slider, Radio, RadioChangeEvent, List,
} from 'antd';
import React, {
    Dispatch, SetStateAction, useContext, useState,
} from 'react';
import * as ReactColor from 'react-color';
import * as THREE from 'three';
import { FileResponse, ReplayData } from '../../lib/api/apiRequests';
import { SettingsContext } from '../../lib/contexts/SettingsContext';
import { getRaceTimeStr } from '../../lib/utils/time';

interface LoadedReplayProps {
    replay: ReplayData;
    followed: ReplayData | undefined;
    setFollowed: Dispatch<SetStateAction<ReplayData | undefined>>;
}

interface LoadedReplaysProps {
    replays: ReplayData[];
}

const LoadedReplay = ({ replay, followed, setFollowed }: LoadedReplayProps): JSX.Element => {
    const [color, setColor] = useState(`#${replay.color.getHexString()}`);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const { numColorChange, setNumColorChange } = useContext(SettingsContext);

    if (followed?._id === replay._id) {
        replay.followed = true;
    } else {
        replay.followed = false;
    }

    const onClick = () => {
        if (replay.followed) {
            setFollowed(undefined);
        } else {
            setFollowed(replay);
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

    const handleClick = () => {
        setShowColorPicker(!showColorPicker);
    };

    return (
        <Row style={{ width: 210 }}>
            <Col span="8">
                <div
                    style={{
                        padding: '5px',
                        background: '#333333',
                        borderRadius: '1px',
                        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                        display: 'inline-block',
                        cursor: 'pointer',
                    }}
                    onClick={handleClick}
                >
                    <div style={{
                        width: '36px',
                        height: '14px',
                        borderRadius: '2px',
                        background: color,
                    }}
                    />
                </div>
                { showColorPicker ? (
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
                        />
                        <ReactColor.ChromePicker
                            disableAlpha
                            color={color}
                            onChange={handleChange}
                        />
                    </div>
                ) : null }

            </Col>
            <Col span="8">
                {getRaceTimeStr(replay.endRaceTime)}
            </Col>
            <Col span="2">
                <EyeOutlined
                    onClick={onClick}
                    style={
                        {
                            opacity: followed?._id === replay._id ? 1 : 0.5,
                        }
                    }
                />
            </Col>

        </Row>
    );
};

const LoadedReplays = ({
    replays,
}: LoadedReplaysProps): JSX.Element => {
    const [visible, setVisible] = useState(false);
    const [followed, setFollowed] = useState<ReplayData>();
    const { numColorChange } = useContext(SettingsContext);

    const toggleSidebar = () => {
        setVisible(!visible);
    };

    const onClose = () => {
        setVisible(false);
    };

    return (
        <div className="absolute right-0 m-6 z-10">
            {!visible
            && (
                <CaretLeftOutlined style={{ marginTop: 226 }} onClick={toggleSidebar} />
            )}
            <Drawer
                style={{ height: 400, opacity: 0.9, marginTop: 300 }}
                mask={false}
                closeIcon={<CaretRightOutlined />}
                title={`${replays.length} Loaded Replays`}
                placement="right"
                width={360}
                onClose={onClose}
                visible={visible}
            >
                <List
                    dataSource={replays}
                    renderItem={(item) => (
                        <List.Item key={item._id}>
                            <List.Item.Meta
                                title={(
                                    <div style={{
                                        color: `#${item.color.getHexString()}`,
                                    }}
                                    >
                                        {item.playerName}
                                    </div>
                                )}
                            />
                            <LoadedReplay replay={item} followed={followed} setFollowed={setFollowed} />
                        </List.Item>
                    )}
                />
            </Drawer>
        </div>
    );
};

export default LoadedReplays;
