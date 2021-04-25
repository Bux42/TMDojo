import React, { createContext, useState } from "react";
import { LineType, LineTypes } from "../../components/viewer/ReplayLines";

export interface SettingsContextProps {
    lineType: LineType;
    changeLineType: (lineType: LineType) => void;
}

export const SettingsContext = createContext<SettingsContextProps>({
    lineType: LineTypes.default,
    changeLineType: () => {},
});

export const SettingsProvider = ({ children }: any): JSX.Element => {
    const [lineType, setLineType] = useState<LineType>(LineTypes.default);

    const changeLineType = (lineType: LineType) => {
        setLineType(lineType);
    };

    return (
        <SettingsContext.Provider
            value={{
                lineType,
                changeLineType,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
