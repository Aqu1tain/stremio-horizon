// Copyright (C) 2017-2026 Smart code 203358507

const getStreamsListStatus = (streams, visibleStreams) => {
    if (streams.length === 0) return 'no-addons';
    if (streams.some((stream) => stream.content.type === 'Loading')) return 'loading';
    if (visibleStreams.length === 0) return 'no-streams';
    return 'ready';
};

module.exports = getStreamsListStatus;
