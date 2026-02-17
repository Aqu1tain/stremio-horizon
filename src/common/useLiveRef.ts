import { useRef, MutableRefObject } from 'react';

const useLiveRef = <T>(value: T): MutableRefObject<T> => {
    const ref = useRef(value);
    ref.current = value;
    return ref;
};

export default useLiveRef;
