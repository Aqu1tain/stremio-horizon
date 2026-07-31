// Copyright (C) 2017-2026 Smart code 203358507

const shouldShowAllDebridVpnHint = require('../src/routes/Player/Error/shouldShowAllDebridVpnHint');

describe('shouldShowAllDebridVpnHint', () => {
    test('recognizes unsupported AllDebrid streams', () => {
        expect(shouldShowAllDebridVpnHint(4, {
            url: 'https://ombfyx.debrid.it/file/movie.mp4',
        })).toBe(true);
    });

    test('recognizes AllDebrid URLs in external player deep links', () => {
        expect(shouldShowAllDebridVpnHint(4, {
            deepLinks: {
                externalPlayer: {
                    streaming: 'https://media.alldebrid.com/file/movie.mp4',
                },
            },
        })).toBe(true);
    });

    test('does not attribute other media errors to a VPN', () => {
        expect(shouldShowAllDebridVpnHint(2, {
            url: 'https://ombfyx.debrid.it/file/movie.mp4',
        })).toBe(false);
    });

    test('does not attribute unsupported non-AllDebrid streams to a VPN', () => {
        expect(shouldShowAllDebridVpnHint(4, {
            url: 'https://example.com/file/movie.mp4',
        })).toBe(false);
    });

    test('does not trust hostnames that only contain an AllDebrid domain', () => {
        expect(shouldShowAllDebridVpnHint(4, {
            url: 'https://debrid.it.evil.example/file/movie.mp4',
        })).toBe(false);
    });

    test('handles missing and malformed stream URLs', () => {
        expect(shouldShowAllDebridVpnHint(4, null)).toBe(false);
        expect(shouldShowAllDebridVpnHint(4, { url: 'not a URL' })).toBe(false);
    });
});
