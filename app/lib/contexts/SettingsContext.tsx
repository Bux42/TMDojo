import React, { createContext, useState } from 'react';
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
    showBlocks: boolean;
    setShowBlocks: (showBlocks: boolean) => void;
    showFullTrail: boolean;
    setShowFullTrail: (showFullTrail: boolean) => void;
    showTrailToStart: boolean;
    setShowTrailToStart: (showFullTrail: boolean) => void;
}

const defaultProps: SettingsContextProps = {
    lineType: LineTypes.default,
    changeLineType: () => { },
    showGearChanges: false,
    setShowGearChanges: () => { },
    showFPS: false,
    setShowFPS: () => { },
    showInputOverlay: true,
    setShowInputOverlay: () => { },
    replayLineOpacity: 0.5,
    setReplayLineOpacity: () => { },
    replayCarOpacity: 0.5,
    setReplayCarOpacity: () => { },
    numColorChange: 0,
    setNumColorChange: () => { },
    showFullTrail: timeLineInfos.showFullTrail,
    setShowFullTrail: () => { },
    showTrailToStart: timeLineInfos.showTrailToStart,
    setShowTrailToStart: () => { },
    showBlocks: true,
    setShowBlocks: () => { },
};

export const SettingsContext = createContext<SettingsContextProps>(defaultProps);

export const SettingsProvider = ({ children }: any): JSX.Element => {
    const [lineType, setLineType] = useState<LineType>(LineTypes.default);
    const [showGearChanges, setShowGearChanges] = useState(false);
    const [showFPS, setShowFPS] = useState(false);
    const [showInputOverlay, setShowInputOverlay] = useState(true);
    const [replayLineOpacity, setReplayLineOpacity] = useState(0.5);
    const [replayCarOpacity, setReplayCarOpacity] = useState(0.5);
    const [numColorChange, setNumColorChange] = useState(0);
    const [showBlocks, setShowBlocks] = useState(defaultProps.showBlocks);
    const [showFullTrail, setShowFullTrail] = useState(timeLineInfos.showFullTrail);
    const [showTrailToStart, setShowTrailToStart] = useState(timeLineInfos.showTrailToStart);

    const changeLineType = (type: LineType) => {
        setLineType(type);
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
                showBlocks,
                setShowBlocks,
                showFullTrail,
                setShowFullTrail,
                showTrailToStart,
                setShowTrailToStart,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
