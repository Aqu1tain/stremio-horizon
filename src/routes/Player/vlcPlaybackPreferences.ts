import * as languages from 'stremio/common/languages';

type Subtitle = {
    id: string,
    lang?: string | null,
    url?: string | null,
    fallbackUrl?: string | null,
};

type SavedSubtitle = {
    id?: string | null,
    embedded?: boolean,
    lang?: string | null,
} | null | undefined;

type Options = {
    audioLanguage?: string | null,
    secondaryAudioLanguage?: string | null,
    subtitlesLanguage?: string | null,
    secondarySubtitlesLanguage?: string | null,
    savedAudioLanguage?: string | null,
    savedSubtitle?: SavedSubtitle,
    subtitles?: Subtitle[] | null,
};

type VlcPlaybackPreferences = {
    audioLanguage: string | null,
    subtitleLanguage: string | null,
    subtitleUrl: string | null,
    subtitlesEnabled: boolean,
};

const normalizeLanguage = (language?: string | null): string | null => {
    if (typeof language !== 'string' || language.trim().length === 0) {
        return null;
    }

    return languages.toCode(language.trim());
};

const languageList = (...values: (string | null | undefined)[]): string[] => {
    return values.reduce<string[]>((result, value) => {
        const normalized = normalizeLanguage(value);
        if (normalized !== null && !result.includes(normalized)) {
            result.push(normalized);
        }
        return result;
    }, []);
};

const usableSubtitleUrl = (subtitle?: Subtitle): string | null => {
    const candidate = subtitle?.url || subtitle?.fallbackUrl;
    if (typeof candidate !== 'string') return null;

    try {
        const parsed = new URL(candidate);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? candidate : null;
    } catch {
        return null;
    }
};

const sameLanguage = (subtitle: Subtitle, language: string): boolean => {
    return normalizeLanguage(subtitle.lang) === language;
};

const buildVlcPlaybackPreferences = ({
    audioLanguage,
    secondaryAudioLanguage,
    subtitlesLanguage,
    secondarySubtitlesLanguage,
    savedAudioLanguage,
    savedSubtitle,
    subtitles,
}: Options): VlcPlaybackPreferences => {
    const audioLanguages = languageList(savedAudioLanguage, audioLanguage, secondaryAudioLanguage);
    const subtitlesEnabled = subtitlesLanguage !== null;

    if (!subtitlesEnabled) {
        return {
            audioLanguage: audioLanguages.join(',') || null,
            subtitleLanguage: null,
            subtitleUrl: null,
            subtitlesEnabled: false,
        };
    }

    const subtitleLanguages = languageList(
        savedSubtitle?.lang,
        subtitlesLanguage,
        secondarySubtitlesLanguage,
    );
    const availableSubtitles = Array.isArray(subtitles) ? subtitles : [];
    const savedExternalSubtitle = savedSubtitle?.embedded === false && savedSubtitle.id ?
        availableSubtitles.find(({ id }) => id === savedSubtitle.id)
        :
        undefined;
    const preferredSubtitle = savedExternalSubtitle ?? subtitleLanguages.reduce<Subtitle | undefined>((match, language) => {
        return match ?? availableSubtitles.find((subtitle) => usableSubtitleUrl(subtitle) !== null && sameLanguage(subtitle, language));
    }, undefined);

    return {
        audioLanguage: audioLanguages.join(',') || null,
        subtitleLanguage: subtitleLanguages.join(',') || null,
        subtitleUrl: usableSubtitleUrl(preferredSubtitle),
        subtitlesEnabled: true,
    };
};

export default buildVlcPlaybackPreferences;
