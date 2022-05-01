import { ClockCircleOutlined } from '@ant-design/icons';
import React from 'react';
import SideDrawerExpandButton from '../common/SideDrawerExpandButton';

interface Props {
    onClick: () => void;
}
const SectorTimeTableButton = ({ onClick }: Props) => (
    <div className="absolute mt-36 z-10">
        <SideDrawerExpandButton
            side="left"
            includeArrowIcon={false}
            content={(
                <>
                    <ClockCircleOutlined className="mr-2" />
                    Sector Time Table
                </>
            )}
            onClick={onClick}
        />
    </div>
);

export default SectorTimeTableButton;
