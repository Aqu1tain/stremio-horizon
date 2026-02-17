import { useRef, useCallback } from 'react';

const useOnScrollToBottom = (cb: ((event: Event) => void) | undefined, threshold = 0) => {
    const triggeredRef = useRef(false);
    const onScroll = useCallback((event: Event) => {
        const target = event.target as HTMLElement;
        if (target.scrollTop + target.clientHeight >= target.scrollHeight - threshold) {
            if (!triggeredRef.current) {
                triggeredRef.current = true;
                if (typeof cb === 'function') {
                    cb(event);
                }
            }
        } else {
            triggeredRef.current = false;
        }
    }, [cb]);
    return onScroll;
};

export default useOnScrollToBottom;
