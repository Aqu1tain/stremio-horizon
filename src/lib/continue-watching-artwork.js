const IMDB_ID_PATTERN = /^tt\d+$/;
const IMDB_EPISODE_ID_PATTERN = /^(tt\d+):(\d+):(\d+)$/;

const getContinueWatchingArtwork = ({ id, type, videoId, poster }) => {
    if (type === 'series' && typeof videoId === 'string') {
        const episode = IMDB_EPISODE_ID_PATTERN.exec(videoId);
        if (episode !== null) {
            return {
                poster: `https://episodes.metahub.space/${episode[1]}/${episode[2]}/${episode[3]}/w780.jpg`,
                fallbackPoster: poster,
            };
        }
    }

    const videoMetaId = typeof videoId === 'string' ? videoId.split(':')[0] : null;
    const imageId = [id, videoMetaId].find((value) => typeof value === 'string' && IMDB_ID_PATTERN.test(value));

    if (type === 'movie' && imageId !== undefined) {
        return {
            poster: `https://images.metahub.space/background/medium/${imageId}/img`,
            fallbackPoster: poster,
        };
    }

    return { poster, fallbackPoster: null };
};

module.exports = getContinueWatchingArtwork;
