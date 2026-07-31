// Drives the patched HTMLVideo error handler without any network or real media.
//
// getContentType short-circuits when the stream carries a content-type behavior hint,
// so `load` reaches the hls.js branch synchronously-ish and the patch registers its
// Hls.Events.ERROR listener on our fake instance.

const HLS_ERROR_TYPES = {
    NETWORK_ERROR: 'networkError',
    MEDIA_ERROR: 'mediaError',
    MUX_ERROR: 'muxError',
    OTHER_ERROR: 'otherError',
};

const HLS_ERROR_DETAILS = {
    BUFFER_STALLED_ERROR: 'bufferStalledError',
    BUFFER_APPENDING_ERROR: 'bufferAppendingError',
    AUDIO_TRACK_LOAD_ERROR: 'audioTrackLoadError',
    AUDIO_TRACK_LOAD_TIMEOUT: 'audioTrackLoadTimeOut',
    FRAG_LOAD_ERROR: 'fragLoadError',
};

const HLS_EVENTS = {
    ERROR: 'hlsError',
    FRAG_BUFFERED: 'hlsFragBuffered',
    AUDIO_TRACKS_UPDATED: 'hlsAudioTracksUpdated',
    AUDIO_TRACK_SWITCHED: 'hlsAudioTrackSwitched',
    MANIFEST_LOADING: 'hlsManifestLoading',
};

const HLS_STREAM = {
    url: 'http://127.0.0.1:11470/hlsv2/test/master.m3u8',
    behaviorHints: {
        proxyHeaders: {
            response: { 'content-type': 'application/vnd.apple.mpegurl' },
        },
    },
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// Loads HTMLVideo with hls.js mocked, and returns the fake Hls instance the patch
// attached its listeners to.
const startHlsPlayback = async () => {
    const Hls = require('hls.js');
    const HTMLVideo = require('@stremio/stremio-video/src/HTMLVideo/HTMLVideo');

    const containerElement = document.createElement('div');
    document.body.appendChild(containerElement);

    const video = new HTMLVideo({ containerElement });
    const errors = [];
    video.on('error', (error) => errors.push(error));

    video.dispatch({
        type: 'command',
        commandName: 'load',
        commandArgs: { stream: HLS_STREAM, autoplay: false, time: 0 },
    });

    await flush();

    const hls = Hls.instances[Hls.instances.length - 1];
    if (!hls) {
        throw new Error('hls.js was never constructed — the load path did not reach the HLS branch');
    }

    return { video, hls, errors };
};

module.exports = {
    HLS_ERROR_TYPES,
    HLS_ERROR_DETAILS,
    HLS_EVENTS,
    HLS_STREAM,
    startHlsPlayback,
    flush,
};
