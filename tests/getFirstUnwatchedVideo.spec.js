/* global describe, expect, test */

const getFirstUnwatchedVideo = require('../src/routes/MetaDetails/VideosList/getFirstUnwatchedVideo');

const released = new Date('2026-01-01T00:00:00.000Z');
const episode = (id, season, number, watched = false, overrides = {}) => ({
    id,
    season,
    episode: number,
    watched,
    released,
    upcoming: false,
    ...overrides,
});

describe('getFirstUnwatchedVideo', () => {
    test('returns the first released unwatched regular episode in story order', () => {
        const videos = [
            episode('s2e1', 2, 1),
            episode('s1e2', 1, 2),
            episode('s1e1', 1, 1, true),
        ];

        expect(getFirstUnwatchedVideo(videos)?.id).toBe('s1e2');
    });

    test('ignores upcoming and unreleased episodes', () => {
        const videos = [
            episode('upcoming', 1, 2, false, { upcoming: true }),
            episode('unreleased', 1, 3, false, { released: null }),
            episode('available', 1, 4),
        ];

        expect(getFirstUnwatchedVideo(videos)?.id).toBe('available');
    });

    test('prefers regular episodes over specials', () => {
        const videos = [
            episode('special', 0, 1),
            episode('regular', 1, 1),
        ];

        expect(getFirstUnwatchedVideo(videos)?.id).toBe('regular');
    });

    test('uses unwatched specials after all regular episodes are watched', () => {
        const videos = [
            episode('special', 0, 1),
            episode('regular', 1, 1, true),
        ];

        expect(getFirstUnwatchedVideo(videos)?.id).toBe('special');
    });

    test('restricts the result to an explicitly selected season', () => {
        const videos = [
            episode('s1e2', 1, 2),
            episode('s2e1', 2, 1),
        ];

        expect(getFirstUnwatchedVideo(videos, 2)?.id).toBe('s2e1');
    });

    test('returns null when every released episode is watched', () => {
        expect(getFirstUnwatchedVideo([
            episode('s1e1', 1, 1, true),
            episode('s1e2', 1, 2, true),
        ])).toBeNull();
    });
});
