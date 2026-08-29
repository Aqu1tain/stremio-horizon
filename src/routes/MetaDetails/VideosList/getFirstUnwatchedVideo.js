const isReleased = (video) => {
    return !video.upcoming && video.released instanceof Date && !isNaN(video.released.getTime());
};

const sortByEpisode = (left, right) => {
    if ((left.season ?? 0) !== (right.season ?? 0)) {
        return (left.season ?? 0) - (right.season ?? 0);
    }

    return (left.episode ?? 0) - (right.episode ?? 0);
};

const getFirstUnwatchedVideo = (videos, season = null) => {
    const releasedUnwatched = videos
        .filter((video) => !video.watched && isReleased(video))
        .sort(sortByEpisode);

    if (typeof season === 'number') {
        return releasedUnwatched.find((video) => video.season === season) ?? null;
    }

    // Specials should not take precedence over the main story, but remain a
    // valid next episode once every regular episode has been watched.
    return releasedUnwatched.find((video) => video.season !== 0) ?? releasedUnwatched[0] ?? null;
};

module.exports = getFirstUnwatchedVideo;
