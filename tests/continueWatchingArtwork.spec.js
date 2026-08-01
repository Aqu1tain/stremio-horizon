const getContinueWatchingArtwork = require('../src/lib/continue-watching-artwork');

describe('getContinueWatchingArtwork', () => {
    test('uses the resumed episode thumbnail for an IMDb series', () => {
        expect(getContinueWatchingArtwork({
            id: 'tt2098220',
            type: 'series',
            videoId: 'tt2098220:1:57',
            poster: 'poster.jpg',
        })).toEqual({
            poster: 'https://episodes.metahub.space/tt2098220/1/57/w780.jpg',
            fallbackPoster: 'poster.jpg',
        });
    });

    test('uses a landscape background for an IMDb movie', () => {
        expect(getContinueWatchingArtwork({
            id: 'tt0899043',
            type: 'movie',
            videoId: 'tt0899043',
            poster: 'poster.jpg',
        })).toEqual({
            poster: 'https://images.metahub.space/background/medium/tt0899043/img',
            fallbackPoster: 'poster.jpg',
        });
    });

    test('can derive an episode thumbnail from a video belonging to another meta provider', () => {
        expect(getContinueWatchingArtwork({
            id: 'tmdb:256721',
            type: 'series',
            videoId: 'tt32612521:1:1',
            poster: 'poster.jpg',
        }).poster).toBe('https://episodes.metahub.space/tt32612521/1/1/w780.jpg');
    });

    test('keeps addon-provided artwork when no matching landscape source exists', () => {
        expect(getContinueWatchingArtwork({
            id: 'custom:show',
            type: 'series',
            videoId: 'custom:episode',
            poster: 'poster.jpg',
        })).toEqual({ poster: 'poster.jpg', fallbackPoster: null });
    });
});
