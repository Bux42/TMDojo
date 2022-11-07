import React, { useContext, useState } from 'react';
import Title from 'antd/lib/typography/Title';
import {
    Button, Checkbox, Drawer, Select, Col, Slider, InputNumber,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CaretLeftOutlined, SettingOutlined } from '@ant-design/icons';
import { SettingsContext } from '../../lib/contexts/SettingsContext';
import { LineTypes } from '../viewer/ReplayLines';
import SideDrawerExpandButton from '../common/SideDrawerExpandButton';
import useWindowDimensions from '../../lib/hooks/useWindowDimensions';
import GlobalTimeLineInfos from '../../lib/singletons/timeLineInfos';
import Text from 'antd/lib/typography/Text';

const SidebarSettings = (): JSX.Element => {
    const [visible, setVisible] = useState(false);
    const windowDimensions = useWindowDimensions();
    const {
        lineType, changeLineType,
        showGearChanges, setShowGearChanges,
        showFPS, setShowFPS,
        showInputOverlay, setShowInputOverlay,
        replayLineOpacity, setReplayLineOpacity,
        replayCarOpacity, setReplayCarOpacity,
        showFullTrail, setShowFullTrail,
        showTrailToStart, setShowTrailToStart,
    } = useContext(
        SettingsContext,
    );

    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    const onClose = () => {
        setVisible(false);
    };

    const toggleSidebar = () => {
        setVisible(!visible);
    };

    const onChangeLineType = (newLineTypeKey: string) => {
        const newLineType = LineTypes[newLineTypeKey];
        if (newLineType !== undefined) {
            changeLineType(newLineType);
        }
    };

    return (
        <div className="absolute right-0 mt-12 z-10">
            <SideDrawerExpandButton
                onClick={toggleSidebar}
                side="right"
                content={(
                    <>
                        Settings
                        <SettingOutlined className="mx-2" />
                    </>
                )}
            />
            <Drawer
                title="Settings"
                placement="right"
                width={Math.min(400, windowDimensions.width)}
                onClose={onClose}
                visible={visible}
                headerStyle={{
                    backgroundColor: '#2C2C2C',
                }}
            >
                <div className="flex flex-col w-full h-full gap-10">
                    <div className="flex flex-col gap-4">
                        <div className="text-xl font-semibold">Visuals</div>
                        <div className="flex gap-4 items-center">
                            <div className="flex-grow">Line Type:</div>
                            <div className="w-3/5">
                                <Select
                                    className="w-full"
                                    value={lineType.name}
                                    onChange={onChangeLineType}
                                >
                                    {Object.keys(LineTypes).map((lineTypeKey) => {
                                        const { name } = LineTypes[lineTypeKey];
                                        return (
                                            <Select.Option key={name} value={lineTypeKey}>
                                                {name}
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-grow">Line Opacity:</div>
                            <div className="w-3/5 px-1">
                                <Slider
                                    className="w-full m-0"
                                    min={0}
                                    max={1}
                                    onChange={(e: number) => setReplayLineOpacity(e)}
                                    value={typeof replayLineOpacity === 'number' ? replayLineOpacity : 0}
                                    step={0.1}
                                    dots
                                />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-grow">Car Opacity:</div>
                            <div className="w-3/5 px-1">
                                <Slider
                                    className="w-full m-0"
                                    min={0}
                                    max={1}
                                    onChange={(e: number) => setReplayCarOpacity(e)}
                                    value={typeof replayCarOpacity === 'number' ? replayCarOpacity : 0}
                                    step={0.1}
                                    dots
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="text-xl font-semibold">Trails</div>
                        <div className="flex items-center">
                            <Checkbox
                                className="select-none"
                                checked={showFullTrail}
                                onChange={(e) => {
                                    setShowFullTrail(e.target.checked);
                                    timeLineGlobal.showFullTrail = e.target.checked;
                                }}
                            >
                                Show full trail
                            </Checkbox>
                        </div>
                        <div className="flex items-center">
                            <Checkbox
                                className="select-none"
                                disabled={showFullTrail}
                                checked={showTrailToStart}
                                onChange={(e) => {
                                    setShowTrailToStart(e.target.checked);
                                    timeLineGlobal.showTrailToStart = e.target.checked;
                                }}
                            >
                                Show trail to start
                            </Checkbox>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-grow">
                                <Text disabled={showFullTrail || showTrailToStart}>Trail length:</Text>
                            </div>
                            <div className="w-3/5 px-1">
                                <InputNumber
                                    addonAfter="ms"
                                    className="w-full"
                                    disabled={showFullTrail || showTrailToStart}
                                    defaultValue={timeLineGlobal.revealTrailTime}
                                    min={0}
                                    step={100}
                                    precision={0}
                                    onChange={(e) => {
                                        if (typeof e === 'number') {
                                            timeLineGlobal.revealTrailTime = e;
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="text-xl font-semibold">Overlays</div>
                        <Col>
                            <Checkbox
                                className="w-full select-none"
                                onChange={(e: CheckboxChangeEvent) => setShowGearChanges(e.target.checked)}
                                checked={showGearChanges}
                            >
                                Show Gear Changes
                            </Checkbox>
                        </Col>
                        <Col>
                            <Checkbox
                                className="w-full select-none"
                                onChange={(e: CheckboxChangeEvent) => setShowInputOverlay(e.target.checked)}
                                checked={showInputOverlay}
                            >
                                Show Input Overlay
                            </Checkbox>
                        </Col>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="text-xl font-semibold">Misc.</div>
                        <Col>
                            <Checkbox
                                className="w-full select-none"
                                onChange={(e: CheckboxChangeEvent) => setShowFPS(e.target.checked)}
                                checked={showFPS}
                            >
                                Show FPS
                            </Checkbox>
                        </Col>
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default SidebarSettings;
