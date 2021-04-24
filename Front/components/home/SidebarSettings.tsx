import { Button, Drawer } from "antd";
import React, { useState } from "react";

export const SidebarSettings = (): JSX.Element => {
    const [visible, setVisible] = useState(false);

    const onClose = () => {
        setVisible(false);
    };

    const toggleSidebar = () => {
        setVisible(!visible);
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
                {"< Settings here >"}
            </Drawer>
        </div>
    );
};
