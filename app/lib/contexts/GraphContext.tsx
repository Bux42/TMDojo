import React, { createContext, useState } from "react";

export interface GraphContextProps {
    range: number[]
    changeRange: (range: number[]) => void;
}

export const GraphContext = createContext<GraphContextProps>({
    range: [],
    changeRange: () => { },
});

export const GraphProvider = ({ children }: any): JSX.Element => {
    const [range, setRange] = useState<number[]>([]);

    const changeRange = (newRange: number[]) => {
        setRange(newRange);
    };

    return (
        <GraphContext.Provider
            value={{
                range,
                changeRange,
            }}
        >
            {children}
        </GraphContext.Provider>
    );
};

const GlobalObject = {
    range: [] as number[],
    lastUpdate: Date.now()
}
export default GlobalObject;