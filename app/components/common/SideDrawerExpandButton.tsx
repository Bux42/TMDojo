import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

interface SideDrawerExpandButtonProps {
    onClick: () => void;
    content: JSX.Element;
    side: 'left' | 'right';
    includeArrowIcon?: boolean;
}
const SideDrawerExpandButton = ({
    onClick, content, side, includeArrowIcon = true,
}: SideDrawerExpandButtonProps) => (
    <Button
        onClick={onClick}
        className="p-6 flex flex-row items-center"
        size="large"
        style={{
            backgroundColor: '#2C2C2C',
            border: 0,
            borderBottomRightRadius: side === 'left' ? 9999 : 0,
            borderTopRightRadius: side === 'left' ? 9999 : 0,
            borderBottomLeftRadius: side === 'right' ? 9999 : 0,
            borderTopLeftRadius: side === 'right' ? 9999 : 0,
        }}
    >
        {side === 'right' ? (
            <>
                {includeArrowIcon && <CaretLeftOutlined className="mr-4" />}
                {content}
            </>
        ) : (
            <>
                {content}
                {includeArrowIcon && <CaretRightOutlined className="ml-4" />}
            </>
        )}
    </Button>
);

export default SideDrawerExpandButton;
