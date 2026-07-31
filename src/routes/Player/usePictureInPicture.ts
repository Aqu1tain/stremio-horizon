// Copyright (C) 2017-2026 Smart code 203358507

import { useCallback, useEffect, useState } from 'react';

type PictureInPicture = {
    supported: boolean,
    active: boolean,
    toggle: () => void,
};

const usePictureInPicture = (videoElement: HTMLVideoElement | null): PictureInPicture => {
    const [active, setActive] = useState(false);

    const supported = videoElement !== null &&
        document.pictureInPictureEnabled === true &&
        videoElement.disablePictureInPicture !== true;

    const toggle = useCallback(() => {
        if (!supported) return;

        if (document.pictureInPictureElement === videoElement) {
            document.exitPictureInPicture().catch((error) => {
                console.error('Failed to exit picture in picture', error);
            });
            return;
        }

        videoElement.requestPictureInPicture().catch((error) => {
            console.error('Failed to enter picture in picture', error);
        });
    }, [supported, videoElement]);

    useEffect(() => {
        if (videoElement === null) {
            setActive(false);
            return;
        }

        setActive(document.pictureInPictureElement === videoElement);

        const onEnter = () => setActive(true);
        const onLeave = () => setActive(false);

        videoElement.addEventListener('enterpictureinpicture', onEnter);
        videoElement.addEventListener('leavepictureinpicture', onLeave);

        return () => {
            videoElement.removeEventListener('enterpictureinpicture', onEnter);
            videoElement.removeEventListener('leavepictureinpicture', onLeave);
        };
    }, [videoElement]);

    return { supported, active, toggle };
};

export default usePictureInPicture;
