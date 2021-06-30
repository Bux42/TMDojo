import React, { useContext, useState } from 'react';
import Title from 'antd/lib/typography/Title';
import {
    Button, Checkbox, Drawer, Select, Row, Col, Slider,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
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
        <div className="absolute right-0 m-8 z-10">
            <Button onClick={toggleSidebar} shape="round" size="large">
                Settings
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
                <Row className="w-full">
                    <Col>
                        <Checkbox
                            className="w-full py-6 select-none"
                            onChange={(e: CheckboxChangeEvent) => setShowGearChanges(e.target.checked)}
                            checked={showGearChanges}
                        >
                            Show Gear Changes
                        </Checkbox>
                    </Col>
                </Row>
                <Row className="w-full">
                    <Col>
                        <Checkbox
                            className="w-full py-6 select-none"
                            onChange={(e: CheckboxChangeEvent) => setShowFPS(e.target.checked)}
                            checked={showFPS}
                        >
                            Show FPS
                        </Checkbox>
                    </Col>
                </Row>
                <Row className="w-full">
                    <Col>
                        <Checkbox
                            className="w-full py-6 select-none"
                            onChange={(e: CheckboxChangeEvent) => setShowInputOverlay(e.target.checked)}
                            checked={showInputOverlay}
                        >
                            Show Input Overlay
                        </Checkbox>
                    </Col>
                </Row>
                <Row className="w-full">
                    <Col>
                        Line Opacity
                    </Col>
                    <Col span={10}>

                        <Slider
                            min={0}
                            max={1}
                            onChange={(e: number) => setReplayLineOpacity(e)}
                            value={typeof replayLineOpacity === 'number' ? replayLineOpacity : 0}
                            step={0.1}
                        />
                    </Col>
                </Row>

            </Drawer>
        </div>
    );
};

export default SidebarSettings;
