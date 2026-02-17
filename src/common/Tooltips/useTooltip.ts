import { useContext } from 'react';
import TooltipContext from './TooltipContext';

const useTooltip = () => {
    return useContext(TooltipContext);
};

export default useTooltip;
