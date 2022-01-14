import React, { CSSProperties, useMemo, useState } from 'react';
import { Button } from 'antd';
import parse from 'parse-color';
import Link from 'next/link';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

interface CleanButtonProps {
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLElement>,
    style?: CSSProperties;
    color?: string;
    url?: string;
    size?: SizeType;
    openInNewTab?: boolean;
}

const getButtonPadding = (size: SizeType) => {
    switch (size) {
    case 'small':
        return '0rem 1rem';
    case 'middle':
        return '0rem 1.5rem';
    default:
        return '0rem 2rem';
    }
};

const ButtonComponent = ({
    children,
    onClick,
    style,
    color = 'hsl(0, 90%, 50%)',
    url,
    size,
    openInNewTab,
}: CleanButtonProps) => {
    const [hover, setHover] = useState(false);

    const parsedColor = parse(color);

    const backColor = `hsl(${parsedColor.hsl[0]}, 100%, 95%)`;

    const buttonStyle = {
        default: {
            backgroundColor: backColor,
            color,
            borderRadius: '6px',
            fontWeight: 600,
            border: 0,
            padding: getButtonPadding(size),
            transition: 'transform .15s cubic-bezier(0.34, 1.56, 0.64, 1) 0s',
        },
        hover: {
            transform: 'scale(1.05)',
        },
    };

    return (
        <Button
            type="primary"
            size={size}
            onClick={onClick}
            onMouseEnter={() => {
                setHover(true);
            }}
            onMouseLeave={() => {
                setHover(false);
            }}
            style={{
                ...buttonStyle.default,
                ...(hover ? buttonStyle.hover : {}),
                ...style,
            }}
            href={!openInNewTab && url ? url : undefined}
        >
            <div className="flex flex-row gap-4 items-center">
                {children}
            </div>
        </Button>
    );
};

const CleanButton = ({
    children,
    onClick,
    style,
    color = 'hsl(0, 90%, 50%)',
    url,
    size = 'middle',
    openInNewTab,
}: CleanButtonProps) => (
    <>
        {url && openInNewTab ? (
            <Link href={url}>
                <a target="_blank" rel="noreferrer" href={url}>
                    <ButtonComponent
                        onClick={onClick}
                        style={style}
                        color={color}
                        url={url}
                        size={size}
                        openInNewTab={openInNewTab}
                    >
                        {children}
                    </ButtonComponent>
                </a>
            </Link>
        ) : (
            <ButtonComponent
                onClick={onClick}
                style={style}
                color={color}
                url={url}
                size={size}
                openInNewTab={openInNewTab}
            >
                {children}
            </ButtonComponent>
        )}
    </>
);

export default CleanButton;
