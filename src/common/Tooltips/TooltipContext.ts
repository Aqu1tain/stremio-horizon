import { createContext } from 'react';

type TooltipOptions = {
    id: string;
    label: string;
    position: string;
    margin: number;
    parent: HTMLElement;
    active?: boolean;
};

type TooltipContextValue = {
    add: (options: TooltipOptions) => void;
    remove: (id: string) => void;
    update: (id: string, state: Partial<TooltipOptions>) => void;
} | null;

const TooltipContext = createContext<TooltipContextValue>(null);

export type { TooltipOptions, TooltipContextValue };
export default TooltipContext;
