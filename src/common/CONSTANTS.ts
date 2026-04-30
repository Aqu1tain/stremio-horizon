type ExternalPlayer = {
    label: string;
    value: string | null;
    platforms: string[];
};

export const CHROMECAST_RECEIVER_APP_ID = '1634F54B';
export const DEFAULT_STREAMING_SERVER_URL = 'http://127.0.0.1:11470/';
export const DEFAULT_SUBTITLES_LANGUAGE = 'eng';
export const LOCAL_SUBTITLES_LANGUAGE = 'local';
export const SUBTITLES_SIZES = [75, 100, 125, 150, 175, 200, 250];
export const SUBTITLES_FONTS = ['PlusJakartaSans', 'Arial', 'Halvetica', 'Times New Roman', 'Verdana', 'Courier', 'Lucida Console', 'sans-serif', 'serif', 'monospace'];
export const SEEK_TIME_DURATIONS = [3000, 5000, 10000, 15000, 20000, 30000];
export const NEXT_VIDEO_POPUP_DURATIONS = [0, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000];
export const CATALOG_PREVIEW_SIZE = 10;
export const CATALOG_PAGE_SIZE = 100;
export const NONE_EXTRA_VALUE = 'None';
export const SKIP_EXTRA_NAME = 'skip';
export const META_LINK_CATEGORY = 'meta';
export const IMDB_LINK_CATEGORY = 'imdb';
export const SHARE_LINK_CATEGORY = 'share';
export const WRITERS_LINK_CATEGORY = 'Writers';
export const TYPE_PRIORITIES: Record<string, number> = {
    movie: 10,
    series: 9,
    channel: 8,
    tv: 7,
    music: 6,
    radio: 5,
    podcast: 4,
    game: 3,
    book: 2,
    adult: 1,
    other: -Infinity
};
export const ICON_FOR_TYPE = new Map<string, string>([
    ['movie', 'movies'],
    ['series', 'series'],
    ['channel', 'channels'],
    ['tv', 'tv'],
    ['book', 'ic_book'],
    ['game', 'ic_games'],
    ['music', 'ic_music'],
    ['adult', 'ic_adult'],
    ['radio', 'ic_radio'],
    ['podcast', 'ic_podcast'],
    ['other', 'movies'],
]);

export const MIME_SIGNATURES: Record<string, string[]> = {
    'application/x-subrip': ['310D0A', '310A'],
    'text/vtt': ['574542565454'],
};

export const SUPPORTED_LOCAL_SUBTITLES = [
    'application/x-subrip',
    'text/vtt',
];

export const EXTERNAL_PLAYERS: ExternalPlayer[] = [
    {
        label: 'EXTERNAL_PLAYER_DISABLED',
        value: null,
        platforms: ['ios', 'visionos', 'android', 'windows', 'linux', 'macos'],
    },
    {
        label: 'EXTERNAL_PLAYER_ALLOW_CHOOSING',
        value: 'choose',
        platforms: ['android'],
    },
    {
        label: 'VLC',
        value: 'vlc',
        platforms: ['ios', 'visionos', 'android'],
    },
    {
        label: 'MPV',
        value: 'mpv',
        platforms: ['macos'],
    },
    {
        label: 'IINA',
        value: 'iina',
        platforms: ['macos'],
    },
    {
        label: 'MX Player',
        value: 'mxplayer',
        platforms: ['android'],
    },
    {
        label: 'Just Player',
        value: 'justplayer',
        platforms: ['android'],
    },
    {
        label: 'Outplayer',
        value: 'outplayer',
        platforms: ['ios', 'visionos'],
    },
    {
        label: 'Moonplayer (VisionOS)',
        value: 'moonplayer',
        platforms: ['visionos'],
    },
    {
        label: 'Infuse',
        value: 'infuse',
        platforms: ['ios', 'visionos', 'macos'],
    },
    {
        label: 'Vidhub',
        value: 'vidhub',
        platforms: ['ios'],
    },
    {
        label: 'M3U Playlist',
        value: 'm3u',
        platforms: ['ios', 'visionos', 'android', 'windows', 'linux', 'macos'],
    },
];

export const WHITELISTED_HOSTS = ['stremio.com', 'strem.io', 'stremio.zendesk.com', 'google.com', 'youtube.com', 'twitch.tv', 'twitter.com', 'x.com', 'netflix.com', 'adex.network', 'amazon.com', 'forms.gle'];

export const PROTOCOL = 'stremio:';

export type { ExternalPlayer };
