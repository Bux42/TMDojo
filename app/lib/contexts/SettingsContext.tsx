import React, { createContext, useState } from 'react';
import { LineType, LineTypes } from '../../components/viewer/ReplayLines';

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
    cameraMode: string;
    setCameraMode: (setCameraMode: string) => void;
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
    cameraMode: '1',
    setCameraMode: () => {},
});

export const SettingsProvider = ({ children }: any): JSX.Element => {
    const [lineType, setLineType] = useState<LineType>(LineTypes.default);
    const [showGearChanges, setShowGearChanges] = useState(false);
    const [showFPS, setShowFPS] = useState(false);
    const [showInputOverlay, setShowInputOverlay] = useState(true);
    const [replayLineOpacity, setReplayLineOpacity] = useState(0.5);
    const [replayCarOpacity, setReplayCarOpacity] = useState(0.5);
    const [cameraMode, setCameraMode] = useState('1');

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
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
