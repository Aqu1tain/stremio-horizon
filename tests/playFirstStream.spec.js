const {
    chooseSeriesVideoId,
    firstPlayableStream,
    parseMetaDetailsHref,
    resolveFirstPlayableStream,
} = require('../src/lib/play-first-stream');

describe('play first stream helpers', () => {
    test('extracts playback identifiers from details links', () => {
        expect(parseMetaDetailsHref('#/detail/series/tt1/tt1%3A1%3A2')).toEqual({
            type: 'series',
            contentId: 'tt1',
            videoId: 'tt1:1:2',
        });
        expect(parseMetaDetailsHref('/metadetails/movie/tt2')).toEqual({
            type: 'movie',
            contentId: 'tt2',
            videoId: null,
        });
    });

    test('selects the first playable stream in addon order', () => {
        const selected = firstPlayableStream([
            { content: { type: 'Ready', content: [{ name: 'Unsupported' }] } },
            { addon: { manifest: { name: 'Second addon' } }, content: { type: 'Ready', content: [
                { name: 'First link', deepLinks: { player: '#/player/first' } },
                { name: 'Second link', deepLinks: { player: '#/player/second' } },
            ] } },
        ]);

        expect(selected.href).toBe('#/player/first');
        expect(selected.addon.manifest.name).toBe('Second addon');
    });

    test('resumes a current series video before choosing the first unwatched episode', () => {
        const state = {
            libraryItem: { state: { video_id: 'show:1:2' } },
            metaItem: { content: { type: 'Ready', content: { videos: [
                { id: 'show:0:1', season: 0, watched: false, upcoming: false },
                { id: 'show:1:1', season: 1, watched: true, upcoming: false },
                { id: 'show:1:2', season: 1, watched: false, upcoming: false },
            ] } } },
        };

        expect(chooseSeriesVideoId(state)).toBe('show:1:2');
    });

    test('loads a movie and opens the first resolved player link', async () => {
        let requestedVideoId = null;
        const transport = {
            dispatch: jest.fn(async (action) => {
                requestedVideoId = action.args.args.streamPath?.id ?? null;
            }),
            getState: jest.fn(async () => ({
                selected: {
                    metaPath: { id: 'tt2' },
                    streamPath: { id: requestedVideoId },
                },
                streams: [{ content: { type: 'Ready', content: [
                    { deepLinks: { player: '#/player/resolved' } },
                ] } }],
            })),
        };

        await expect(resolveFirstPlayableStream({
            transport,
            type: 'movie',
            contentId: 'tt2',
            videoId: null,
        })).resolves.toMatchObject({ href: '#/player/resolved' });
        expect(requestedVideoId).toBe('tt2');
    });
});
