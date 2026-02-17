import { useState, useEffect, useCallback, useRef, RefObject } from 'react';

const SCROLL_THRESHOLD = 10;

const useNavbarScroll = (containerRef: RefObject<HTMLElement | null>, enabled = true) => {
    const [visible, setVisible] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const lastScrollTop = useRef(0);

    const handleScroll = useCallback((event: Event) => {
        const target = event.target as HTMLElement;
        if (!target || target.scrollTop === undefined) return;
        if (target.scrollHeight <= target.clientHeight) return;

        const currentScrollTop = target.scrollTop;
        setScrolled(currentScrollTop > SCROLL_THRESHOLD);

        const delta = currentScrollTop - lastScrollTop.current;
        if (Math.abs(delta) < SCROLL_THRESHOLD) return;

        setVisible(delta < 0 || currentScrollTop <= SCROLL_THRESHOLD);
        lastScrollTop.current = currentScrollTop;
    }, []);

    useEffect(() => {
        if (!enabled) {
            setVisible(true);
            setScrolled(false);
            lastScrollTop.current = 0;
            return;
        }

        const container = containerRef?.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll, { capture: true, passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll, { capture: true });
        };
    }, [containerRef, handleScroll, enabled]);

    return { visible, scrolled };
};

export default useNavbarScroll;
