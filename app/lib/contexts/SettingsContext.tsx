import React, { createContext, useState } from 'react';
import { LineType, LineTypes } from '../../components/viewer/ReplayLines';

export interface SettingsContextProps {
    lineType: LineType;
    changeLineType: (lineType: LineType) => void;
    showGearChanges: boolean;
    setShowGearChanges: (showGearChanges: boolean) => void;
}

export const SettingsContext = createContext<SettingsContextProps>({
    lineType: LineTypes.default,
    changeLineType: () => {},
    showGearChanges: false,
    setShowGearChanges: () => {},
});

export const SettingsProvider = ({ children }: any): JSX.Element => {
    const [lineType, setLineType] = useState<LineType>(LineTypes.default);
    const [showGearChanges, setShowGearChanges] = useState(false);

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
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
