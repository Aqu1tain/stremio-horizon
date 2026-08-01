import { formatBytes, groupDownloads, mergeDownload, progressPercent } from '../src/routes/Downloads/utils';
import type { DownloadItem } from '../src/lib/downloads';

const { createMetaDetailsLoadAction, firstDownloadableStream } = require('../src/lib/episode-download');

const item = (overrides: Partial<DownloadItem> = {}): DownloadItem => ({
    id: 'one',
    title: 'Episode',
    subtitle: null,
    contentType: null,
    contentId: null,
    videoId: null,
    season: null,
    episode: null,
    description: null,
    sourceName: null,
    thumbnailUrl: null,
    fileName: 'episode.mkv',
    status: 'downloading',
    downloadedBytes: 25,
    totalBytes: 100,
    createdAt: 1,
    updatedAt: 1,
    error: null,
    playbackUrl: 'http://localhost:11480/__downloads__/one/one.mkv',
    ...overrides,
});

describe('downloads helpers', () => {
    test('merges updates without duplicating an item and keeps newest first', () => {
        const result = mergeDownload(
            [item(), item({ id: 'two', createdAt: 2 })],
            item({ status: 'completed', downloadedBytes: 100 })
        );
        expect(result.map(({ id }) => id)).toEqual(['two', 'one']);
        expect(result[1].status).toBe('completed');
    });

    test('formats byte totals and clamps progress', () => {
        expect(formatBytes(1536)).toBe('1.5 KB');
        expect(progressPercent(item())).toBe(25);
        expect(progressPercent(item({ downloadedBytes: 120 }))).toBe(100);
        expect(progressPercent(item({ totalBytes: null }))).toBeNull();
    });

    test('groups series by content and versions by episode', () => {
        const result = groupDownloads([
            item({ id: 's1e1-a', title: 'Hunter x Hunter', subtitle: 'S1 E1 · Departure', contentType: 'series', contentId: 'tt2098220', videoId: 'tt2098220:1:1', season: 1, episode: 1 }),
            item({ id: 's1e1-b', title: 'Hunter x Hunter', subtitle: 'S1 E1 · Departure', contentType: 'series', contentId: 'tt2098220', videoId: 'tt2098220:1:1', season: 1, episode: 1, sourceName: 'Another source' }),
            item({ id: 's1e2', title: 'Hunter x Hunter', subtitle: 'S1 E2 · Test', contentType: 'series', contentId: 'tt2098220', videoId: 'tt2098220:1:2', season: 1, episode: 2 }),
        ]);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('series');
        expect(result[0].episodes).toHaveLength(2);
        expect(result[0].episodes[0].versions).toHaveLength(2);
    });

    test('keeps a movie flat while grouping multiple versions', () => {
        const result = groupDownloads([
            item({ id: 'movie-a', title: 'Into the Wild', contentType: 'movie', contentId: 'tt0758758' }),
            item({ id: 'movie-b', title: 'Into the Wild', contentType: 'movie', contentId: 'tt0758758', sourceName: '4K source' }),
        ]);

        expect(result).toHaveLength(1);
        expect(result[0].episodes).toHaveLength(0);
        expect(result[0].versions).toHaveLength(2);
    });

    test('keeps groups and legacy episodes in place while progress events update timestamps', () => {
        const downloads = [
            item({ id: 'show-a-e1', title: 'Show A', subtitle: 'Pilot', contentType: 'series', contentId: 'show-a', createdAt: 10, updatedAt: 10 }),
            item({ id: 'show-a-e2', title: 'Show A', subtitle: 'Second', contentType: 'series', contentId: 'show-a', createdAt: 20, updatedAt: 20 }),
            item({ id: 'show-b-e1', title: 'Show B', subtitle: 'Pilot', contentType: 'series', contentId: 'show-b', createdAt: 30, updatedAt: 30 }),
        ];
        const before = groupDownloads(downloads);
        const after = groupDownloads(downloads.map((download) => download.id === 'show-a-e1'
            ? { ...download, downloadedBytes: 75, updatedAt: 999 }
            : download));

        expect(before.map(({ key }) => key)).toEqual(after.map(({ key }) => key));
        expect(before[1].episodes.map(({ key }) => key)).toEqual(after[1].episodes.map(({ key }) => key));
    });

    test('selects the first downloadable stream in addon order', () => {
        const selected = firstDownloadableStream([
            { addon: { manifest: { name: 'First addon' } }, content: { type: 'Ready', content: [{ name: 'Unsupported' }] } },
            { addon: { manifest: { name: 'Second addon' } }, content: { type: 'Ready', content: [
                { name: 'First link', deepLinks: { externalPlayer: { download: 'https://example.com/first.mp4' } } },
                { name: 'Second link', deepLinks: { externalPlayer: { download: 'https://example.com/second.mp4' } } },
            ] } },
        ]);

        expect(selected.url).toBe('https://example.com/first.mp4');
        expect(selected.addon.manifest.name).toBe('Second addon');
    });

    test('builds the same MetaDetails request used by episode navigation', () => {
        expect(createMetaDetailsLoadAction({ type: 'series', contentId: 'tt1', videoId: 'tt1:1:2' }))
            .toMatchObject({ args: { model: 'MetaDetails', args: { streamPath: { resource: 'stream', type: 'series', id: 'tt1:1:2' } } } });
    });
});
