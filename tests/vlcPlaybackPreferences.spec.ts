import buildVlcPlaybackPreferences from '../src/routes/Player/vlcPlaybackPreferences';

describe('VLC playback preferences', () => {
    test('uses the app audio and subtitle languages and picks a matching subtitle URL', () => {
        expect(buildVlcPlaybackPreferences({
            audioLanguage: 'fre',
            secondaryAudioLanguage: 'eng',
            subtitlesLanguage: 'fre',
            secondarySubtitlesLanguage: 'eng',
            subtitles: [
                { id: 'english', lang: 'eng', url: 'https://example.com/en.srt' },
                { id: 'french', lang: 'fre', url: 'https://example.com/fr.srt' },
            ],
        })).toEqual({
            audioLanguage: 'fra,eng',
            subtitleLanguage: 'fra,eng',
            subtitleUrl: 'https://example.com/fr.srt',
            subtitlesEnabled: true,
        });
    });

    test('keeps a previously selected external subtitle ahead of language defaults', () => {
        expect(buildVlcPlaybackPreferences({
            audioLanguage: 'eng',
            subtitlesLanguage: 'fre',
            savedSubtitle: { id: 'chosen', embedded: false, lang: 'spa' },
            subtitles: [
                { id: 'french', lang: 'fre', url: 'https://example.com/fr.srt' },
                { id: 'chosen', lang: 'spa', fallbackUrl: 'https://example.com/es.srt' },
            ],
        })).toMatchObject({
            subtitleLanguage: 'spa,fra',
            subtitleUrl: 'https://example.com/es.srt',
        });
    });

    test('turns VLC subtitles off when they are disabled in the app', () => {
        expect(buildVlcPlaybackPreferences({
            audioLanguage: 'eng',
            subtitlesLanguage: null,
            subtitles: [{ id: 'english', lang: 'eng', url: 'https://example.com/en.srt' }],
        })).toEqual({
            audioLanguage: 'eng',
            subtitleLanguage: null,
            subtitleUrl: null,
            subtitlesEnabled: false,
        });
    });

    test('does not pass unsafe subtitle URLs to the desktop process', () => {
        expect(buildVlcPlaybackPreferences({
            subtitlesLanguage: 'eng',
            subtitles: [{ id: 'local', lang: 'eng', url: 'file:///tmp/subtitle.srt' }],
        }).subtitleUrl).toBeNull();
    });
});
