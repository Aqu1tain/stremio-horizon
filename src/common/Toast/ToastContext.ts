import { createContext } from 'react';

type ToastOptions = {
    type: string;
    title: string;
    timeout?: number;
    dataset?: Record<string, unknown>;
};

type ToastFilter = (item: ToastOptions) => boolean;

type ToastId = ReturnType<typeof setTimeout> | null;

type ToastContextValue = {
    show: (options: ToastOptions) => ToastId;
    remove: (id: ToastId) => void;
    clear: () => void;
    addFilter?: (filter: ToastFilter) => void;
    removeFilter?: (filter: ToastFilter) => void;
};

const noop = () => void 0;
const noopShow = () => null;

const ToastContext = createContext<ToastContextValue>({
    show: noopShow,
    remove: noop,
    clear: noop,
});

ToastContext.displayName = 'ToastContext';

export type { ToastOptions, ToastFilter, ToastContextValue };
export default ToastContext;
