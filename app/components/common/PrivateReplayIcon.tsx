import EyeInvisibleOutlined from "@ant-design/icons/lib/icons/EyeInvisibleOutlined";
import { Tooltip } from "antd";

const PrivateReplayIcon = () => (
    <Tooltip title="Only visible to you">
        <EyeInvisibleOutlined />
    </Tooltip>
);

export default PrivateReplayIcon;
