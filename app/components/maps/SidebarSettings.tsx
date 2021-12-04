import React, { useContext, useState } from 'react';
import Title from 'antd/lib/typography/Title';
import {
    Button, Checkbox, Drawer, Select, Col, Slider,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CaretLeftOutlined, SettingOutlined } from '@ant-design/icons';
import { SettingsContext } from '../../lib/contexts/SettingsContext';
import { LineTypes } from '../viewer/ReplayLines';

const SidebarSettings = (): JSX.Element => {
    const [visible, setVisible] = useState(false);
    const {
        lineType, changeLineType,
        showGearChanges, setShowGearChanges,
        showFPS, setShowFPS,
        showInputOverlay, setShowInputOverlay,
        replayLineOpacity, setReplayLineOpacity,
        replayCarOpacity, setReplayCarOpacity,
    } = useContext(
        SettingsContext,
    );

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
            <Button
                onClick={toggleSidebar}
                className="p-6 flex flex-row items-center"
                size="large"
                style={{
                    backgroundColor: '#1f1f1f',
                    border: 0,
                    borderBottomLeftRadius: 9999,
                    borderTopLeftRadius: 9999,
                }}
            >
                <CaretLeftOutlined />
                <div className="ml-4">
                    Settings
                    <SettingOutlined className="mx-2" />
                </div>
            </Button>
            <Drawer
                title="Settings"
                placement="right"
                width={400}
                onClose={onClose}
                visible={visible}
            >
                <Title level={5}>Line Type</Title>
                <Select
                    className="w-full"
                    size="large"
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
                <Col>
                    <Checkbox
                        className="w-full py-6 select-none"
                        onChange={(e: CheckboxChangeEvent) => setShowGearChanges(e.target.checked)}
                        checked={showGearChanges}
                    >
                        Show Gear Changes
                    </Checkbox>
                </Col>
                <Col>
                    <Checkbox
                        className="w-full py-6 select-none"
                        onChange={(e: CheckboxChangeEvent) => setShowFPS(e.target.checked)}
                        checked={showFPS}
                    >
                        Show FPS
                    </Checkbox>
                </Col>
                <Col>
                    <Checkbox
                        className="w-full py-6 select-none"
                        onChange={(e: CheckboxChangeEvent) => setShowInputOverlay(e.target.checked)}
                        checked={showInputOverlay}
                    >
                        Show Input Overlay
                    </Checkbox>
                </Col>
                Line Opacity
                <Slider
                    min={0}
                    max={1}
                    onChange={(e: number) => setReplayLineOpacity(e)}
                    value={typeof replayLineOpacity === 'number' ? replayLineOpacity : 0}
                    step={0.1}
                />
                Car Opacity
                <Slider
                    min={0}
                    max={1}
                    onChange={(e: number) => setReplayCarOpacity(e)}
                    value={typeof replayCarOpacity === 'number' ? replayCarOpacity : 0}
                    step={0.1}
                />
            </Drawer>
        </div>
    );
};

export default SidebarSettings;
