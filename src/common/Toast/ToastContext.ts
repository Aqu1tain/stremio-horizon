import { createContext } from 'react';

type ToastOptions = {
    type: string;
    title: string;
    timeout?: number;
    dataset?: Record<string, unknown>;
};

type ToastFilter = (item: ToastOptions) => boolean;

type ToastContextValue = {
    show: (options: ToastOptions) => void;
    clear: () => void;
    addFilter?: (filter: ToastFilter) => void;
    removeFilter?: (filter: ToastFilter) => void;
};

const ToastContext = createContext<ToastContextValue>({
    show: () => { },
    clear: () => { },
});

ToastContext.displayName = 'ToastContext';

export type { ToastOptions, ToastFilter, ToastContextValue };
export default ToastContext;
