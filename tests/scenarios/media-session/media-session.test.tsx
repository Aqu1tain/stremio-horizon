/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import useMediaSession from 'stremio/routes/Player/useMediaSession';

const shell = { active: false, on: jest.fn(), off: jest.fn(), send: jest.fn() };

jest.mock('stremio/common', () => ({
    usePlatform: () => ({ shell: mockShell }),
}));

// jest.mock factories may only close over names prefixed with "mock".
const mockShell = shell;

const PLAYER = { metaItem: null, selected: null, nextVideo: null } as any;

const render = (videoState: any, onSeek = jest.fn()) => renderHook(
    () => useMediaSession(videoState, PLAYER, false, jest.fn(), jest.fn(), jest.fn(), onSeek)
);

describe('media session', () => {
    let setActionHandler: jest.Mock;
    let setPositionState: jest.Mock;

    const installMediaSession = () => {
        setActionHandler = jest.fn();
        setPositionState = jest.fn();
        (navigator as any).mediaSession = { setActionHandler, setPositionState, playbackState: 'none' };
    };

    beforeEach(installMediaSession);

    afterEach(() => {
        delete (navigator as any).mediaSession;
        jest.clearAllMocks();
    });

    test('publishes position so the PiP scrubber has a timeline', () => {
        render({ paused: false, time: 30000, duration: 600000, playbackSpeed: 1 });

        expect(setPositionState).toHaveBeenCalledWith({ duration: 600, position: 30, playbackRate: 1 });
    });

    test('clears a stale timeline when the stream has no usable duration', () => {
        render({ paused: false, time: 0, duration: null, playbackSpeed: 1 });

        // Called with nothing — otherwise the OS controls keep the previous stream's
        // duration and allow seeking somewhere meaningless.
        expect(setPositionState).toHaveBeenCalledWith();
    });

    test('ignores intermediate fastSeek events while the scrubber is dragged', () => {
        const onSeek = jest.fn();
        render({ paused: false, time: 30000, duration: 600000, playbackSpeed: 1 }, onSeek);

        const seekto = setActionHandler.mock.calls.find(([action]) => action === 'seekto')[1];

        seekto({ seekTime: 120, fastSeek: true });
        expect(onSeek).not.toHaveBeenCalled();

        seekto({ seekTime: 120 });
        expect(onSeek).toHaveBeenCalledWith(120000);
    });

    test('an action the browser does not implement does not break the player', () => {
        setActionHandler.mockImplementation((action: string) => {
            if (action === 'seekto') throw new DOMException('Unsupported', 'NotSupportedError');
        });

        expect(() => render({ paused: false, time: 0, duration: 600000, playbackSpeed: 1 })).not.toThrow();
    });

    test('unmounting without a Media Session API does not throw', () => {
        delete (navigator as any).mediaSession;

        const { unmount } = render({ paused: false, time: 0, duration: 600000, playbackSpeed: 1 });

        expect(() => unmount()).not.toThrow();
    });
});
