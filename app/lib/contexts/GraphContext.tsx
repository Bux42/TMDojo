import React, { createContext, useState } from "react";

export interface GraphContextProps {
    range: number[]
    changeRange: (range: number[]) => void;
}

export const GraphContext = createContext<GraphContextProps>({
    range: [],
    changeRange: () => { },
});

let timer: NodeJS.Timeout;

const debounce = (callback: () => any, timeout: number) => {
    return () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback();
        }, timeout);
    };
};

export const GraphProvider = ({ children }: any): JSX.Element => {
    const [range, setRange] = useState<number[]>([]);

    const changeRange = (newRange: number[]) => {
        let myDebounce = debounce(function() {
            setRange(newRange);
        }, 200);
        myDebounce();
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