const SERIES_EPISODE_PATTERN = /:(\d+):(\d+)$/;

const getContinueWatchingLabel = ({ name, type, videoId }) => {
    if (type !== 'series' || typeof videoId !== 'string') {
        return name;
    }

    const episode = SERIES_EPISODE_PATTERN.exec(videoId);
    if (episode === null) {
        return name;
    }

    const episodeLabel = `S${Number(episode[1])}:E${Number(episode[2])}`;
    return typeof name === 'string' && name.length > 0 ? `${name} · ${episodeLabel}` : episodeLabel;
};

module.exports = getContinueWatchingLabel;
