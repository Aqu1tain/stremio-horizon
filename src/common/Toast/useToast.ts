import { useContext } from 'react';
import ToastContext from './ToastContext';

const useToast = () => {
    return useContext(ToastContext);
};

export default useToast;
