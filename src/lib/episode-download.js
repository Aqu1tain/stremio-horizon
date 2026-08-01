const POLL_INTERVAL_MS = 250;
const STREAM_RESOLUTION_TIMEOUT_MS = 45_000;

const createMetaDetailsLoadAction = ({ type, contentId, videoId }) => ({
    action: 'Load',
    args: {
        model: 'MetaDetails',
        args: {
            metaPath: {
                resource: 'meta',
                type,
                id: contentId,
                extra: [],
            },
            streamPath: typeof videoId === 'string' && videoId.length > 0 ? {
                resource: 'stream',
                type,
                id: videoId,
                extra: [],
            } : null,
            guessStream: true,
        },
    },
});

const selectedVideoId = (state) => state?.selected?.streamPath?.id ?? null;

const firstDownloadableStream = (streams) => {
    for (const addonStreams of streams ?? []) {
        if (addonStreams?.content?.type !== 'Ready') continue;
        for (const stream of addonStreams.content.content ?? []) {
            const url = stream?.deepLinks?.externalPlayer?.download;
            if (typeof url === 'string' && url.length > 0) {
                return { addon: addonStreams.addon, stream, url };
            }
        }
    }
    return null;
};

const delay = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

const waitForResolvedStream = async (transport, videoId, timeout = STREAM_RESOLUTION_TIMEOUT_MS) => {
    const deadline = Date.now() + timeout;
    let candidate = null;

    while (Date.now() < deadline) {
        const state = await transport.getState('meta_details');
        if (selectedVideoId(state) === videoId) {
            candidate = firstDownloadableStream(state.streams) ?? candidate;
            const loading = (state.streams ?? []).some(({ content }) => content?.type === 'Loading');
            if (!loading) {
                if (candidate !== null) return candidate;
                throw new Error('HORIZON_NO_DOWNLOADABLE_SOURCE');
            }
        }
        await delay(POLL_INTERVAL_MS);
    }

    if (candidate !== null) return candidate;
    throw new Error('HORIZON_STREAM_RESOLUTION_TIMEOUT');
};

const waitForSelection = async (transport, videoId, timeout = 5_000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        const state = await transport.getState('meta_details');
        if (selectedVideoId(state) === videoId) return;
        await delay(POLL_INTERVAL_MS);
    }
};

module.exports = {
    createMetaDetailsLoadAction,
    firstDownloadableStream,
    waitForResolvedStream,
    waitForSelection,
};
