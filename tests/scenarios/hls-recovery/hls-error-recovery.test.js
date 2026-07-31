/**
 * @jest-environment jsdom
 */

// Guards the @stremio/stremio-video patch (Stremio/stremio-video#142). Upstream registers
// no Hls.Events.ERROR listener, so once hls.js exhausts its retries the audio source buffer
// can stall while video keeps decoding — playback looks normal and unmuted but is silent.
// Horizon's Tauri shell exposes no shellTransport, so all of its playback goes through
// HTMLVideo + hls.js, which makes this reachable in normal use.
//
// If the patch ever stops applying, these fail.

const {
    HLS_ERROR_TYPES,
    HLS_ERROR_DETAILS,
    HLS_EVENTS,
    startHlsPlayback,
} = require('./__harness__/HlsHarness');

jest.mock('hls.js', () => require('./__harness__/mockHls').build({
    events: {
        ERROR: 'hlsError',
        FRAG_BUFFERED: 'hlsFragBuffered',
        AUDIO_TRACKS_UPDATED: 'hlsAudioTracksUpdated',
        AUDIO_TRACK_SWITCHED: 'hlsAudioTrackSwitched',
        MANIFEST_LOADING: 'hlsManifestLoading',
    },
    errorTypes: {
        NETWORK_ERROR: 'networkError',
        MEDIA_ERROR: 'mediaError',
        MUX_ERROR: 'muxError',
        OTHER_ERROR: 'otherError',
    },
    errorDetails: {
        BUFFER_STALLED_ERROR: 'bufferStalledError',
        BUFFER_APPENDING_ERROR: 'bufferAppendingError',
        AUDIO_TRACK_LOAD_ERROR: 'audioTrackLoadError',
        AUDIO_TRACK_LOAD_TIMEOUT: 'audioTrackLoadTimeOut',
        FRAG_LOAD_ERROR: 'fragLoadError',
    },
}));

const fatalMediaError = () => ({ fatal: true, type: HLS_ERROR_TYPES.MEDIA_ERROR, details: 'bufferAppendingError' });

describe('hls.js error recovery (patched HTMLVideo)', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
        require('hls.js').instances.length = 0;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        document.body.innerHTML = '';
    });

    test('an ERROR listener is registered at all — the patch is applied', async () => {
        const { hls } = await startHlsPlayback();
        expect(hls.listenerCount(HLS_EVENTS.ERROR)).toBe(1);
    });

    test.each([
        HLS_ERROR_DETAILS.BUFFER_STALLED_ERROR,
        HLS_ERROR_DETAILS.BUFFER_APPENDING_ERROR,
        HLS_ERROR_DETAILS.AUDIO_TRACK_LOAD_ERROR,
        HLS_ERROR_DETAILS.AUDIO_TRACK_LOAD_TIMEOUT,
    ])('a non-fatal stalling error (%s) restarts loading', async (details) => {
        const { hls } = await startHlsPlayback();

        hls.emit(HLS_EVENTS.ERROR, { fatal: false, type: HLS_ERROR_TYPES.MEDIA_ERROR, details });

        expect(hls.startLoad).toHaveBeenCalledTimes(1);
    });

    test('an unrelated non-fatal error is left to hls.js', async () => {
        const { hls } = await startHlsPlayback();

        hls.emit(HLS_EVENTS.ERROR, {
            fatal: false,
            type: HLS_ERROR_TYPES.NETWORK_ERROR,
            details: HLS_ERROR_DETAILS.FRAG_LOAD_ERROR,
        });

        expect(hls.startLoad).not.toHaveBeenCalled();
        expect(hls.recoverMediaError).not.toHaveBeenCalled();
    });

    test('a repeated stall does not restart loading on every tick', async () => {
        const { hls } = await startHlsPlayback();
        const stall = { fatal: false, type: HLS_ERROR_TYPES.MEDIA_ERROR, details: HLS_ERROR_DETAILS.BUFFER_STALLED_ERROR };

        for (let i = 0; i < 20; i++) {
            hls.emit(HLS_EVENTS.ERROR, stall);
        }

        // gap-controller re-emits on every stall tick; without throttling this would be 20.
        expect(hls.startLoad).toHaveBeenCalledTimes(1);
    });

    test('a fatal network error restarts loading', async () => {
        const { hls } = await startHlsPlayback();

        hls.emit(HLS_EVENTS.ERROR, { fatal: true, type: HLS_ERROR_TYPES.NETWORK_ERROR, details: HLS_ERROR_DETAILS.FRAG_LOAD_ERROR });

        expect(hls.startLoad).toHaveBeenCalledTimes(1);
        expect(hls.recoverMediaError).not.toHaveBeenCalled();
    });

    test('a fatal media error recovers, and swaps audio codec when it repeats quickly', async () => {
        const { hls } = await startHlsPlayback();

        hls.emit(HLS_EVENTS.ERROR, fatalMediaError());
        expect(hls.recoverMediaError).toHaveBeenCalledTimes(1);
        expect(hls.swapAudioCodec).not.toHaveBeenCalled();

        // A second media error inside the burst window blames the audio codec.
        hls.emit(HLS_EVENTS.ERROR, fatalMediaError());
        expect(hls.swapAudioCodec).toHaveBeenCalledTimes(1);
        expect(hls.recoverMediaError).toHaveBeenCalledTimes(2);
    });

    test('recovery is capped, then surfaces a critical error instead of stalling silently', async () => {
        const { hls, errors } = await startHlsPlayback();

        for (let i = 0; i < 4; i++) {
            hls.emit(HLS_EVENTS.ERROR, fatalMediaError());
        }

        expect(hls.recoverMediaError).toHaveBeenCalledTimes(3);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ critical: true });
    });

    test('a buffered fragment resets the recovery budget', async () => {
        const { hls, errors } = await startHlsPlayback();

        for (let i = 0; i < 3; i++) {
            hls.emit(HLS_EVENTS.ERROR, fatalMediaError());
        }
        hls.emit(HLS_EVENTS.FRAG_BUFFERED, {});
        hls.emit(HLS_EVENTS.ERROR, fatalMediaError());

        expect(hls.recoverMediaError).toHaveBeenCalledTimes(4);
        expect(errors).toHaveLength(0);
    });

    test('a fatal error of another type is left alone', async () => {
        const { hls, errors } = await startHlsPlayback();

        hls.emit(HLS_EVENTS.ERROR, { fatal: true, type: HLS_ERROR_TYPES.MUX_ERROR, details: 'remuxAllocError' });

        expect(hls.startLoad).not.toHaveBeenCalled();
        expect(hls.recoverMediaError).not.toHaveBeenCalled();
        expect(errors).toHaveLength(0);
    });
});
