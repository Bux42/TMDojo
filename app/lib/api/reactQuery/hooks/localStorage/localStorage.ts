import { useState } from 'react';
import store from 'store2';

const useLocalStorage = (key: string, initialValue: any) => {
    const [storedValue, setStoredValue] = useState(() => {
        const item = store.get(key);
        return item !== null ? item : initialValue;
    });

    const setValue = (value: any) => {
        setStoredValue(value);
        store.set(key, value);
    };

    return [storedValue, setValue];
};

export default useLocalStorage;
