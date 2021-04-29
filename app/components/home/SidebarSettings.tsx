import React, { useContext, useState } from "react";
import Title from "antd/lib/typography/Title";
import { Button, Drawer, Select } from "antd";
import { Option } from "antd/lib/mentions";
import { SettingsContext } from "../../lib/contexts/SettingsContext";
import { LineTypes } from "../viewer/ReplayLines";

export const SidebarSettings = (): JSX.Element => {
    const [visible, setVisible] = useState(false);
    const { lineType, changeLineType } = useContext(SettingsContext);

    const onClose = () => {
        setVisible(false);
    };

    const toggleSidebar = () => {
        setVisible(!visible);
    };

    const onChangeLineType = (newLineTypeKey: string) => {
	const newLineType = LineTypes[newLineTypeKey];
        if (newLineType != undefined) {
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
                    className={"w-full"}
                    size="large"
                    value={lineType.name}
                    onChange={onChangeLineType}
                >
                    {Object.keys(LineTypes).map((lineTypeKey) => {
                        const { name } = LineTypes[lineTypeKey];
                        return (
                            <Option key={name} value={lineTypeKey}>
                                {name}
                            </Option>
                        );
                    })}
                </Select>
            </Drawer>
        </div>
    );
};
