import React, { createContext, useState } from 'react';
import { LineType, LineTypes } from '../../components/viewer/ReplayLines';

// eslint false positive https://stackoverflow.com/questions/63961803/
// eslint-disable-next-line no-shadow
export enum CameraMode {
    Target,
    Cam1,
}

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
    setReplayCarOpacity: (setCameraMode: number) => void;
    cameraMode: CameraMode;
    setCameraMode: (setCameraMode: CameraMode) => void;
    numColorChange: number;
    setNumColorChange: (numColorChange: number) => void;
}

export const SettingsContext = createContext<SettingsContextProps>({
    lineType: LineTypes.default,
    changeLineType: () => {},
    showGearChanges: false,
    setShowGearChanges: () => {},
    showFPS: false,
    setShowFPS: () => {},
    showInputOverlay: true,
    setShowInputOverlay: () => {},
    replayLineOpacity: 0.5,
    setReplayLineOpacity: () => {},
    replayCarOpacity: 0.5,
    setReplayCarOpacity: () => {},
    cameraMode: CameraMode.Cam1,
    setCameraMode: () => {},
    numColorChange: 0,
    setNumColorChange: () => {},
});

export const SettingsProvider = ({ children }: any): JSX.Element => {
    const [lineType, setLineType] = useState<LineType>(LineTypes.default);
    const [showGearChanges, setShowGearChanges] = useState(false);
    const [showFPS, setShowFPS] = useState(false);
    const [showInputOverlay, setShowInputOverlay] = useState(true);
    const [replayLineOpacity, setReplayLineOpacity] = useState(0.5);
    const [replayCarOpacity, setReplayCarOpacity] = useState(0.5);
    const [cameraMode, setCameraMode] = useState(CameraMode.Cam1);
    const [numColorChange, setNumColorChange] = useState(0);

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
                cameraMode,
                setCameraMode,
                numColorChange,
                setNumColorChange,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
