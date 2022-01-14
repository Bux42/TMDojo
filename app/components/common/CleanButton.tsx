import React, { CSSProperties, useMemo, useState } from 'react';
import { Button } from 'antd';
import parse from 'parse-color';
import Link from 'next/link';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { ButtonType } from 'antd/lib/button';

interface CleanButtonProps {
    children?: React.ReactNode;
    style?: CSSProperties;
    onClick?: React.MouseEventHandler<HTMLElement>,
    size?: SizeType;
    backColor?: string;
    textColor?: string;
    type?: ButtonType;
    url?: string;
    openInNewTab?: boolean;
    hoverAnimation?: boolean;
    useTextColorForShadow?: boolean;
    disabled?: boolean;
    darkenOnHover?: boolean;
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
    style,
    onClick,
    size = 'middle',
    backColor,
    textColor,
    type = 'primary',
    url,
    openInNewTab,
    hoverAnimation = true,
    disabled,
    darkenOnHover = true,
}: CleanButtonProps) => {
    const [hover, setHover] = useState(false);

    const parsedBackColor = backColor && parse(backColor);

    const darkenedBackColor = backColor && parsedBackColor
        && `hsl(${parsedBackColor.hsl[0]}, ${parsedBackColor.hsl[1]}%, ${parsedBackColor.hsl[2] * 0.8}%)`;

    const cssTextColor = textColor
        || 'rgba(255, 255, 255, 0.85)';

    const buttonStyle = {
        default: {
            backgroundColor: backColor,
            color: cssTextColor,
            borderRadius: '6px',
            fontWeight: 600,
            border: 0,
            padding: getButtonPadding(size),
            transition: 'all .15s',
        },
        hover: {
            backgroundColor: darkenOnHover ? darkenedBackColor : backColor,
            transform: 'translate(0px, -2px)',
            boxShadow: '0px 2px 2px 0px rgba(0,0,0, 0.25)',
        },
    };

    return (
        <Button
            type={type}
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
                ...(hover && hoverAnimation ? buttonStyle.hover : {}),
                ...style,
            }}
            href={!openInNewTab && url ? url : undefined}
            disabled={disabled}
        >
            <div className="flex flex-row gap-4 items-center">
                {children}
            </div>
        </Button>
    );
};

const CleanButton = ({
    children,
    style,
    onClick,
    size,
    backColor,
    textColor,
    type,
    url,
    openInNewTab,
    hoverAnimation,
    disabled,
    darkenOnHover,
}: CleanButtonProps) => {
    const button = useMemo(() => (
        <ButtonComponent
            onClick={onClick}
            style={style}
            backColor={backColor}
            textColor={textColor}
            type={type}
            url={url}
            size={size}
            openInNewTab={openInNewTab}
            hoverAnimation={hoverAnimation}
            disabled={disabled}
            darkenOnHover={darkenOnHover}
        >
            {children}
        </ButtonComponent>
    ), [children, onClick, style, backColor, textColor, type, url, size,
        openInNewTab, hoverAnimation, disabled, darkenOnHover]);

    return (
        <>
            {url && openInNewTab ? (
                <Link href={url}>
                    <a target="_blank" rel="noreferrer" href={url}>
                        {button}
                    </a>
                </Link>
            ) : (
                button
            )}
        </>
    );
};

export default CleanButton;
