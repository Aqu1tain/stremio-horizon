const getContinueWatchingLabel = require('../src/lib/continue-watching-label');

describe('getContinueWatchingLabel', () => {
    test('adds the resumed season and episode to a series title', () => {
        expect(getContinueWatchingLabel({
            name: 'Hunter x Hunter (2011)',
            type: 'series',
            videoId: 'tt2098220:2:1',
        })).toBe('Hunter x Hunter (2011) · S2:E1');
    });

    test('does not change movie titles', () => {
        expect(getContinueWatchingLabel({
            name: 'The Amateur',
            type: 'movie',
            videoId: 'tt0899043',
        })).toBe('The Amateur');
    });

    test('keeps the original title when an addon uses a non-episodic id', () => {
        expect(getContinueWatchingLabel({
            name: 'Custom Show',
            type: 'series',
            videoId: 'custom:episode',
        })).toBe('Custom Show');
    });
});
