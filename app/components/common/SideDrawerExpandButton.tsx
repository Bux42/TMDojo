import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

interface SideDrawerExpandButtonProps {
    onClick: () => void;
    content: JSX.Element;
    side:'left'|'right';
}
const SideDrawerExpandButton = ({ onClick, content, side }: SideDrawerExpandButtonProps) => (
    <Button
        onClick={onClick}
        className="p-6 flex flex-row items-center"
        size="large"
        style={{
            backgroundColor: '#1f1f1f',
            border: 0,
            borderBottomRightRadius: side === 'left' ? 9999 : 0,
            borderTopRightRadius: side === 'left' ? 9999 : 0,
            borderBottomLeftRadius: side === 'right' ? 9999 : 0,
            borderTopLeftRadius: side === 'right' ? 9999 : 0,
        }}
    >
        {side === 'right' ? (
            <>
                <CaretLeftOutlined className="mr-4" />
                {content}
            </>
        ) : (
            <>
                {content}
                <CaretRightOutlined className="ml-4" />
            </>
        )}
    </Button>
);

export default SideDrawerExpandButton;
