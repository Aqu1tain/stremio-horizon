const getStreamsListStatus = require('../src/routes/MetaDetails/StreamsList/getStreamsListStatus');

describe('getStreamsListStatus', () => {
    test('reports that no addons were requested', () => {
        expect(getStreamsListStatus([], [])).toBe('no-addons');
    });

    test('keeps loading while at least one addon is pending', () => {
        const streams = [
            { content: { type: 'Ready', content: [{ name: 'Available stream' }] } },
            { content: { type: 'Loading' } },
        ];

        expect(getStreamsListStatus(streams, streams[0].content.content)).toBe('loading');
    });

    test('reports no streams only after every addon has settled', () => {
        const streams = [
            { content: { type: 'Ready', content: [] } },
            { content: { type: 'Err', error: new Error('Unavailable') } },
        ];

        expect(getStreamsListStatus(streams, [])).toBe('no-streams');
    });

    test('reports ready when settled addons returned streams', () => {
        const visibleStreams = [{ name: 'Available stream' }];
        const streams = [{ content: { type: 'Ready', content: visibleStreams } }];

        expect(getStreamsListStatus(streams, visibleStreams)).toBe('ready');
    });
});
