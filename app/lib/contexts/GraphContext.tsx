import React, { createContext, useState } from 'react';

export interface GraphContextProps {
    range: number[]
    changeRange: (range: number[]) => void;
}

export const GraphContext = createContext<GraphContextProps>({
    range: [],
    changeRange: () => { },
});

// eslint-disable-next-line no-undef
let timer: NodeJS.Timeout;

const debounce = (callback: () => any, timeout: number) => () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        callback();
    }, timeout);
};

export const GraphProvider = ({ children }: any): JSX.Element => {
    const [range, setRange] = useState<number[]>([]);

    const changeRange = (newRange: number[]) => {
        const myDebounce = debounce(() => {
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
