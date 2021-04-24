import { Button, Drawer } from "antd";
import React, { useState } from "react";

export const SidebarReplays = (): JSX.Element => {
    const [visible, setVisible] = useState(false);

    const onClose = () => {
        setVisible(false);
    };

    const toggleSidebar = () => {
        setVisible(!visible);
    };

    return (
        <div className="absolute m-8">
            <Button onClick={toggleSidebar} shape="round" size="large">
                Replay List
            </Button>
            <Drawer
                title="Select replays"
                placement="left"
                width={400}
                onClose={onClose}
                visible={visible}
            >
                {"< Replay list here >"}
            </Drawer>
        </div>
    );
};
