import { useMemo } from 'react';

const usePWA = (): [boolean | undefined, boolean] => {
    const isPWA = useMemo(() => {
        const isIOSPWA = (navigator as Navigator & { standalone?: boolean }).standalone;
        const isAndroidPWA = window.matchMedia('(display-mode: standalone)').matches;
        return [isIOSPWA, isAndroidPWA] as [boolean | undefined, boolean];
    }, []);
    return isPWA;
};

export default usePWA;
