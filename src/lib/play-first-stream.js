const { createMetaDetailsLoadAction } = require('./episode-download');

const POLL_INTERVAL_MS = 250;
const STREAM_RESOLUTION_TIMEOUT_MS = 45_000;
const EMPTY_STREAMS_GRACE_MS = 2_000;

const delay = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

const parseMetaDetailsHref = (href) => {
    if (typeof href !== 'string' || href.length === 0) return null;

    let pathname = href;
    try {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
        const url = new URL(href, origin);
        pathname = url.hash.startsWith('#/') ? url.hash.slice(1) : url.pathname;
    } catch (_) {
        pathname = href.startsWith('#') ? href.slice(1) : href;
    }

    const match = pathname.match(/^\/(?:metadetails|detail)\/([^/]+)\/([^/]+)(?:\/([^/?#]+))?/);
    if (!match) return null;

    return {
        type: decodeURIComponent(match[1]),
        contentId: decodeURIComponent(match[2]),
        videoId: typeof match[3] === 'string' ? decodeURIComponent(match[3]) : null,
    };
};

const firstPlayableStream = (streams) => {
    for (const addonStreams of streams ?? []) {
        if (addonStreams?.content?.type !== 'Ready') continue;
        for (const stream of addonStreams.content.content ?? []) {
            const href = stream?.deepLinks?.player;
            if (typeof href === 'string' && href.length > 0) {
                return { addon: addonStreams.addon, stream, href };
            }
        }
    }
    return null;
};

const chooseSeriesVideoId = (state) => {
    if (state?.metaItem?.content?.type !== 'Ready') return null;

    const videos = state.metaItem.content.content?.videos ?? [];
    const playable = videos.filter((video) => !video.upcoming);
    const nonSpecials = playable.filter((video) => video.season !== 0);
    const candidates = nonSpecials.length > 0 ? nonSpecials : playable;
    const libraryVideoId = state.libraryItem?.state?.video_id;
    const resumeVideo = candidates.find((video) => video.id === libraryVideoId && !video.watched);

    return (resumeVideo ?? candidates.find((video) => !video.watched) ?? candidates[0])?.id ?? null;
};

const selectedContentId = (state) => state?.selected?.metaPath?.id ?? null;
const selectedVideoId = (state) => state?.selected?.streamPath?.id ?? null;

const waitForSeriesVideoId = async (transport, contentId, timeout = STREAM_RESOLUTION_TIMEOUT_MS) => {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
        const state = await transport.getState('meta_details');
        if (selectedContentId(state) === contentId) {
            const videoId = selectedVideoId(state) ?? chooseSeriesVideoId(state);
            if (typeof videoId === 'string' && videoId.length > 0) return videoId;
            if (state?.metaItem?.content?.type === 'Err') throw new Error('HORIZON_NO_PLAYABLE_SOURCE');
        }
        await delay(POLL_INTERVAL_MS);
    }

    throw new Error('HORIZON_PLAYBACK_RESOLUTION_TIMEOUT');
};

const waitForPlayableStream = async (transport, videoId, timeout = STREAM_RESOLUTION_TIMEOUT_MS) => {
    const deadline = Date.now() + timeout;
    let candidate = null;
    let selectedAt = null;

    while (Date.now() < deadline) {
        const state = await transport.getState('meta_details');
        if (selectedVideoId(state) === videoId) {
            if (selectedAt === null) selectedAt = Date.now();
            const streams = state.streams ?? [];
            candidate = firstPlayableStream(streams) ?? candidate;
            const loading = streams.some(({ content }) => content?.type === 'Loading');
            const settledEmpty = streams.length === 0 && Date.now() - selectedAt >= EMPTY_STREAMS_GRACE_MS;

            if ((!loading && streams.length > 0) || settledEmpty) {
                if (candidate !== null) return candidate;
                throw new Error('HORIZON_NO_PLAYABLE_SOURCE');
            }
        }
        await delay(POLL_INTERVAL_MS);
    }

    if (candidate !== null) return candidate;
    throw new Error('HORIZON_PLAYBACK_RESOLUTION_TIMEOUT');
};

const resolveFirstPlayableStream = async ({ transport, type, contentId, videoId }) => {
    let targetVideoId = videoId ?? (type === 'movie' ? contentId : null);

    await transport.dispatch(createMetaDetailsLoadAction({
        type,
        contentId,
        videoId: targetVideoId,
    }), 'meta_details');

    if (targetVideoId === null) {
        targetVideoId = await waitForSeriesVideoId(transport, contentId);
        await transport.dispatch(createMetaDetailsLoadAction({
            type,
            contentId,
            videoId: targetVideoId,
        }), 'meta_details');
    }

    return waitForPlayableStream(transport, targetVideoId);
};

module.exports = {
    chooseSeriesVideoId,
    firstPlayableStream,
    parseMetaDetailsHref,
    resolveFirstPlayableStream,
    waitForPlayableStream,
};
