import { useRef, useCallback } from 'react';

const useAnimationFrame = (): [(cb: () => void) => void, () => void] => {
    const animationFrameId = useRef<number | null>(null);
    const cancel = useCallback(() => {
        if (animationFrameId.current !== null) {
            cancelAnimationFrame(animationFrameId.current);
        }
        animationFrameId.current = null;
    }, []);
    const request = useCallback((cb: () => void) => {
        cancel();
        animationFrameId.current = requestAnimationFrame(() => {
            cb();
            animationFrameId.current = null;
        });
    }, []);
    return [request, cancel];
};

export default useAnimationFrame;
