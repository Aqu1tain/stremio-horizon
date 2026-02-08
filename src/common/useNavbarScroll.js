const { useState, useEffect, useCallback, useRef } = require('react');

const SCROLL_THRESHOLD = 10;

const useNavbarScroll = (containerRef, enabled = true) => {
    const [visible, setVisible] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const lastScrollTop = useRef(0);

    const handleScroll = useCallback((event) => {
        const target = event.target;
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

module.exports = useNavbarScroll;
