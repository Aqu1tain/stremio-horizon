import { useState, useCallback } from 'react';

const useBinaryState = (initialValue?: boolean): [boolean, () => void, () => void, () => void] => {
    const [value, setValue] = useState(!!initialValue);
    const on = useCallback(() => {
        setValue(true);
    }, []);
    const off = useCallback(() => {
        setValue(false);
    }, []);
    const toggle = useCallback(() => {
        setValue((prev) => !prev);
    }, []);
    return [value, on, off, toggle];
};

export default useBinaryState;
