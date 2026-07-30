import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { isFileType, isFileTypeSupported } from './utils';
import styles from './styles.less';

export type FileType = string;
export type FileDropListener = (file: File, buffer: ArrayBuffer, supported: boolean) => void;

type FileDropContext = {
    on: (type: FileType, listener: FileDropListener) => void,
    off: (type: FileType, listener: FileDropListener) => void,
};

const FileDropContext = createContext({} as FileDropContext);

type Props = {
    children: React.ReactNode,
};

const FileDropProvider = ({ children }: Props) => {
    const listeners = useRef<[FileType, FileDropListener][]>([]);
    const [active, setActive] = useState(false);

    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
        setActive(true);
    };

    const onDragLeave = () => {
        setActive(false);
    };

    const on = (type: FileType, listener: FileDropListener) => {
        listeners.current = [...listeners.current, [type, listener]];
    };

    const off = (type: FileType, listener: FileDropListener) => {
        listeners.current = listeners.current.filter(([key, value]) => key !== type && value !== listener);
    };

    useEffect(() => {
        const onDrop = (event: DragEvent) => {
            event.preventDefault();
            const { dataTransfer } = event;

            if (dataTransfer && dataTransfer?.files.length > 0) {
                const file = dataTransfer.files[0];

                file
                    .arrayBuffer()
                    .then((buffer) => {
                        listeners.current
                            .filter(([type]) => type === '*')
                            .forEach(([, listener]) => listener(file, buffer, isFileTypeSupported(buffer)));
                        listeners.current
                            .filter(([type]) => type !== '*' && (file.type ? type === file.type : isFileType(buffer, type)))
                            .forEach(([, listener]) => listener(file, buffer, true));
                    })
                    .catch(console.error);
            }

            setActive(false);
        };

        window.addEventListener('dragover', onDragOver);
        window.addEventListener('dragleave', onDragLeave);
        window.addEventListener('drop', onDrop);

        return () => {
            window.removeEventListener('dragover', onDragOver);
            window.removeEventListener('dragleave', onDragLeave);
            window.removeEventListener('drop', onDrop);
        };
    }, []);

    return (
        <FileDropContext.Provider value={{ on, off }}>
            { children }
            <div className={classNames(styles['file-drop-container'], { 'active': active })} />
        </FileDropContext.Provider>
    );
};

const useFileDrop = () => {
    return useContext(FileDropContext);
};

export {
    FileDropProvider,
    useFileDrop,
};
