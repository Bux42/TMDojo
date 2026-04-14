import React, { useCallback, useEffect, useRef } from 'react';
import { Slider, SliderSingleProps } from 'antd';
import GlobalTimeLineInfos from '../../../lib/singletons/timeLineInfos';
import { getRaceTimeStr } from '../../../lib/utils/time';

interface SliderProps {
    onChange: (value: number) => void;
}
const TimelineSlider = ({ onChange }: SliderProps) => {
    const timeLineGlobal = GlobalTimeLineInfos.getInstance();

    const formatter: NonNullable<SliderSingleProps['tooltip']>['formatter'] = (
        value,
    ) => getRaceTimeStr(value || 0);

    return (
        <Slider
            defaultValue={0}
            value={timeLineGlobal.currentRaceTime}
            max={timeLineGlobal.maxRaceTime}
            disabled={timeLineGlobal.maxRaceTime === 0}
            onChange={onChange}
            tooltip={{ formatter }}
        />
    );
};

export default TimelineSlider;
