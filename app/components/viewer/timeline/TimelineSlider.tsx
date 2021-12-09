import React, { useCallback, useEffect, useRef } from 'react';
import GlobalTimeLineInfos from '../../../lib/singletons/timeLineInfos';

interface SliderProps {
    onChange: (value: number) => void;
    yDragMargin?: number;
}
const TimelineSlider = ({
    onChange, yDragMargin,
}: SliderProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    let mouseDown = false;
    let isDraggingSlider = false;

    const handleMouseDown = useCallback((e: MouseEvent) => {
        const { clientX, clientY } = e;
        mouseDown = true;
        if (ref.current) {
            const {
                x, y, width, height,
            } = ref.current.getBoundingClientRect();
            const dragMargin = yDragMargin || 0;
            if (clientX >= x
                && clientX <= x + width
                && clientY >= y - dragMargin
                && clientY <= y + height + dragMargin) {
                isDraggingSlider = true;
            }
        }
    }, []);
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (mouseDown && isDraggingSlider && ref.current) {
            const {
                x, width,
            } = ref.current.getBoundingClientRect();
            const { clientX } = e;

            const fraction = Math.min(1, Math.max(0, (clientX - x) / width));
            const newValue = fraction * timeLineGlobal.maxRaceTime;

            onChange(newValue);
        }
    }, []);
    const handleMouseUp = useCallback((e: MouseEvent) => {
        mouseDown = false;
        isDraggingSlider = false;
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const mapValueToPercent = (inputValue: number) => {
        const percent = inputValue / timeLineGlobal.maxRaceTime;
        return percent;
    };

    return (
        <div
            ref={ref}
            className="flex flex-row h-full w-full"
            style={{
                backgroundColor: '#3f3f3f',
            }}
        >
            {/* Blue background */}
            <div
                className="h-full"
                style={{
                    backgroundColor: '#007CD6',
                    width: `${mapValueToPercent(timeLineGlobal.currentRaceTime) * 100.0}%`,
                }}
            />

            {/* White line */}
            <div
                className="h-full"
                style={{ backgroundColor: '#AAA', width: '2px' }}
            />

            {/* Arrow indicator */}
            <div
                style={{
                    position: 'relative',
                    width: 0,
                    height: 0,
                    left: '-7px',
                    top: '-4px',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        width: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid #AAA',
                    }}
                />
            </div>
        </div>
    );
};

export default TimelineSlider;
