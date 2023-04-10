import React, { createContext, useState } from 'react';
import store from 'store2';
import { LineType, LineTypes } from '../../components/viewer/ReplayLines';
import GlobalTimeLineInfos from '../singletons/timeLineInfos';
import useLocalStorage from '../api/reactQuery/hooks/localStorage/localStorage';
import {
    REPLAY_CAR_OPACITY,
    REPLAY_LINE_OPACITY,
    REVEAL_TRAIL_TIME,
    SHOW_FPS, SHOW_FULL_TRAIL, SHOW_GEAR_CHANGE,
    SHOW_INPUT_OVERLAY,
    SHOW_TRAIL_TO_START,
} from './SettingsContext.constants';

// eslint false positive https://stackoverflow.com/questions/63961803/
// eslint-disable-next-line no-shadow
export enum CameraMode {
    Target,
    Follow,
}

// Timeline singleton used to intialize settings context values to the same values
const timeLineInfos = GlobalTimeLineInfos.getInstance();

export interface SettingsContextProps {
    lineType: LineType;
    changeLineType: (lineType: LineType) => void;
    showGearChanges: boolean;
    setShowGearChanges: (showGearChanges: boolean) => void;
    showFPS: boolean;
    setShowFPS: (showFPS: boolean) => void;
    showInputOverlay: boolean;
    setShowInputOverlay: (showInputs: boolean) => void;
    replayLineOpacity: number;
    setReplayLineOpacity: (setLineOpacity: number) => void;
    replayCarOpacity: number;
    setReplayCarOpacity: (setReplayCarOpacity: number) => void;
    numColorChange: number;
    setNumColorChange: (numColorChange: number) => void;
    showFullTrail: boolean;
    changeShowFullTrail: (showFullTrail: boolean) => void;
    showTrailToStart: boolean;
    changeShowTrailToStart: (showFullTrail: boolean) => void;
    revealTrailTime: number;
    changeRevealTrailTime: (revealTrailTime: number) => void;
}

export const SettingsContext = createContext<SettingsContextProps>({
    lineType: LineTypes.default,
    changeLineType: () => { },
    showGearChanges: SHOW_GEAR_CHANGE,
    setShowGearChanges: () => { },
    showFPS: SHOW_FPS,
    setShowFPS: () => { },
    showInputOverlay: SHOW_INPUT_OVERLAY,
    setShowInputOverlay: () => { },
    replayLineOpacity: REPLAY_LINE_OPACITY,
    setReplayLineOpacity: () => { },
    replayCarOpacity: REPLAY_CAR_OPACITY,
    setReplayCarOpacity: () => { },
    numColorChange: 0,
    setNumColorChange: () => { },
    showFullTrail: SHOW_FULL_TRAIL,
    changeShowFullTrail: () => { },
    showTrailToStart: SHOW_TRAIL_TO_START,
    changeShowTrailToStart: () => { },
    revealTrailTime: REVEAL_TRAIL_TIME,
    changeRevealTrailTime: () => { },
});

const getLineType = (): LineType => {
    const storedLineType = store.get('lineType');

    if (storedLineType && LineTypes[storedLineType.toLowerCase()] !== null) {
        const storedLineTypeValue = LineTypes[storedLineType.toLowerCase()];
        return storedLineTypeValue;
    }

    return LineTypes.default;
};

const getShowFullTrail = (): boolean => {
    const storedShowFullTrail = store.get('showFullTrail');

    if (storedShowFullTrail !== null) {
        timeLineInfos.showFullTrail = storedShowFullTrail;
        return storedShowFullTrail;
    }

    timeLineInfos.showFullTrail = SHOW_FULL_TRAIL;
    return SHOW_FULL_TRAIL;
};
const getShowTrailToStart = (): boolean => {
    const storedShowTrailToStart = store.get('showTrailToStart');

    if (storedShowTrailToStart !== null) {
        timeLineInfos.showTrailToStart = storedShowTrailToStart;
        return storedShowTrailToStart;
    }

    timeLineInfos.showTrailToStart = SHOW_TRAIL_TO_START;
    return SHOW_TRAIL_TO_START;
};

const getRevealTrailTime = (): number => {
    const storedRevealTrailTime = store.get('revealTrailTime');

    if (storedRevealTrailTime !== null) {
        timeLineInfos.revealTrailTime = storedRevealTrailTime;
        return storedRevealTrailTime;
    }

    timeLineInfos.revealTrailTime = REVEAL_TRAIL_TIME;
    return REVEAL_TRAIL_TIME;
};

export const SettingsProvider = ({ children }: any): JSX.Element => {
    const [lineType, setLineType] = useState<LineType>(getLineType());
    const [showGearChanges, setShowGearChanges] = useLocalStorage('showGearChanges', SHOW_GEAR_CHANGE);
    const [showFPS, setShowFPS] = useLocalStorage('showFPS', SHOW_FPS);
    const [showInputOverlay, setShowInputOverlay] = useLocalStorage('showInputOverlay', SHOW_INPUT_OVERLAY);
    const [replayLineOpacity, setReplayLineOpacity] = useLocalStorage('replayLineOpacity', REPLAY_LINE_OPACITY);
    const [replayCarOpacity, setReplayCarOpacity] = useLocalStorage('replayCarOpacity', REPLAY_CAR_OPACITY);
    const [numColorChange, setNumColorChange] = useState(0);
    const [showFullTrail, setShowFullTrail] = useState(getShowFullTrail());
    const [showTrailToStart, setShowTrailToStart] = useState(getShowTrailToStart());
    const [revealTrailTime, setRevealTrailTime] = useState(getRevealTrailTime());

    const changeLineType = (type: LineType) => {
        setLineType(type);
        store.set('lineType', type.name);
    };

    const changeShowFullTrail = (show: boolean) => {
        setShowFullTrail(show);
        timeLineInfos.showFullTrail = show;
        store.set('showFullTrail', show);
    };
    const changeShowTrailToStart = (show: boolean) => {
        setShowTrailToStart(show);
        timeLineInfos.showTrailToStart = show;
        store.set('showTrailToStart', show);
    };

    const changeRevealTrailTime = (time: number) => {
        setRevealTrailTime(time);
        timeLineInfos.revealTrailTime = time;
        store.set('revealTrailTime', time);
    };

    return (
        <SettingsContext.Provider
            value={{
                lineType,
                changeLineType,
                showGearChanges,
                setShowGearChanges,
                showFPS,
                setShowFPS,
                showInputOverlay,
                setShowInputOverlay,
                replayLineOpacity,
                setReplayLineOpacity,
                replayCarOpacity,
                setReplayCarOpacity,
                numColorChange,
                setNumColorChange,
                showFullTrail,
                changeShowFullTrail,
                showTrailToStart,
                changeShowTrailToStart,
                revealTrailTime,
                changeRevealTrailTime,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
