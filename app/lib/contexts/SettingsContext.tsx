import React, { createContext, useState } from 'react';
import store from 'store2';
import { LineType, LineTypes } from '../../components/viewer/ReplayLines';
import GlobalTimeLineInfos from '../singletons/timeLineInfos';

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
    changeShowGearChanges: (showGearChanges: boolean) => void;
    showFPS: boolean;
    changeShowFPS: (showFPS: boolean) => void;
    showInputOverlay: boolean;
    changeShowInputOverlay: (showInputs: boolean) => void;
    replayLineOpacity: number;
    changeReplayLineOpacity: (setLineOpacity: number) => void;
    replayCarOpacity: number;
    changeReplayCarOpacity: (setReplayCarOpacity: number) => void;
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
    showGearChanges: false,
    changeShowGearChanges: () => { },
    showFPS: false,
    changeShowFPS: () => { },
    showInputOverlay: true,
    changeShowInputOverlay: () => { },
    replayLineOpacity: 0.5,
    changeReplayLineOpacity: () => { },
    replayCarOpacity: 0.5,
    changeReplayCarOpacity: () => { },
    numColorChange: 0,
    setNumColorChange: () => { },
    showFullTrail: timeLineInfos.showFullTrail,
    changeShowFullTrail: () => { },
    showTrailToStart: timeLineInfos.showTrailToStart,
    changeShowTrailToStart: () => { },
    revealTrailTime: timeLineInfos.revealTrailTime,
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

const getShowGearChanges = (): boolean => {
    const storedShowGearChanges = store.get('showGearChanges');

    if (storedShowGearChanges !== null) {
        return storedShowGearChanges;
    }

    return false;
};

const getShowFPS = (): boolean => {
    const storedShowFPS = store.get('showFPS');

    if (storedShowFPS !== null) {
        return storedShowFPS;
    }

    return false;
};

const getShowInputOverlay = (): boolean => {
    const storedShowInputOverlay = store.get('showInputOverlay');

    if (storedShowInputOverlay !== null) {
        return storedShowInputOverlay;
    }

    return true;
};

const getReplayLineOpacity = (): number => {
    const storedReplayLineOpacity = store.get('replayLineOpacity');

    if (storedReplayLineOpacity !== null) {
        return storedReplayLineOpacity;
    }

    return 0.5;
};

const getReplayCarOpacity = (): number => {
    const storedReplayCarOpacity = store.get('replayCarOpacity');

    if (storedReplayCarOpacity !== null) {
        return storedReplayCarOpacity;
    }

    return 0.5;
};

const getShowFullTrail = (): boolean => {
    const storedShowFullTrail = store.get('showFullTrail');

    if (storedShowFullTrail !== null) {
        timeLineInfos.showFullTrail = storedShowFullTrail;
        return storedShowFullTrail;
    }

    timeLineInfos.showFullTrail = true;
    return true;
};

const getShowTrailToStart = (): boolean => {
    const storedShowTrailToStart = store.get('showTrailToStart');

    if (storedShowTrailToStart !== null) {
        timeLineInfos.showTrailToStart = storedShowTrailToStart;
        return storedShowTrailToStart;
    }

    timeLineInfos.showTrailToStart = true;
    return true;
};

const getRevealTrailTime = (): number => {
    const storedRevealTrailTime = store.get('revealTrailTime');

    if (storedRevealTrailTime !== null) {
        timeLineInfos.revealTrailTime = storedRevealTrailTime;
        return storedRevealTrailTime;
    }

    timeLineInfos.revealTrailTime = 1000;
    return 1000;
};

export const SettingsProvider = ({ children }: any): JSX.Element => {
    const [lineType, setLineType] = useState<LineType>(getLineType());
    const [showGearChanges, setShowGearChanges] = useState(getShowGearChanges());
    const [showFPS, setShowFPS] = useState(getShowFPS());
    const [showInputOverlay, setShowInputOverlay] = useState(getShowInputOverlay());
    const [replayLineOpacity, setReplayLineOpacity] = useState(getReplayLineOpacity());
    const [replayCarOpacity, setReplayCarOpacity] = useState(getReplayCarOpacity());
    const [numColorChange, setNumColorChange] = useState(0);
    const [showFullTrail, setShowFullTrail] = useState(getShowFullTrail());
    const [showTrailToStart, setShowTrailToStart] = useState(getShowTrailToStart());
    const [revealTrailTime, setRevealTrailTime] = useState(getRevealTrailTime());

    // console.log("showFullTrail", showFullTrail)

    const changeLineType = (type: LineType) => {
        setLineType(type);
        store.set('lineType', type.name);
    };

    const changeShowGearChanges = (gearChanges: boolean) => {
        setShowGearChanges(gearChanges);
        store.set('showGearChanges', gearChanges);
    };

    const changeShowFPS = (show: boolean) => {
        setShowFPS(show);
        store.set('showFPS', show);
    };

    const changeShowInputOverlay = (show: boolean) => {
        setShowInputOverlay(show);
        store.set('showInputOverlay', show);
    };

    const changeReplayLineOpacity = (opacity: number) => {
        setReplayLineOpacity(opacity);
        store.set('replayLineOpacity', opacity);
    };

    const changeReplayCarOpacity = (opacity: number) => {
        setReplayCarOpacity(opacity);
        store.set('replayCarOpacity', opacity);
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
                changeShowGearChanges,
                showFPS,
                changeShowFPS,
                showInputOverlay,
                changeShowInputOverlay,
                replayLineOpacity,
                changeReplayLineOpacity,
                replayCarOpacity,
                changeReplayCarOpacity,
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
