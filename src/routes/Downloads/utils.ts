import type { DownloadItem } from 'stremio/lib/downloads';

export type DownloadEpisodeGroup = {
    key: string,
    videoId: string | null,
    season: number | null,
    episode: number | null,
    title: string,
    description: string | null,
    thumbnailUrl: string | null,
    versions: DownloadItem[],
    createdAt: number,
};

export type DownloadContentGroup = {
    key: string,
    type: 'series' | 'movie',
    contentId: string | null,
    title: string,
    description: string | null,
    thumbnailUrl: string | null,
    episodes: DownloadEpisodeGroup[],
    versions: DownloadItem[],
    createdAt: number,
};

export const mergeDownload = (items: DownloadItem[], changed: DownloadItem): DownloadItem[] => {
    return [changed, ...items.filter((item) => item.id !== changed.id)]
        .sort((left, right) => right.createdAt - left.createdAt || left.id.localeCompare(right.id));
};

export const formatBytes = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / (1024 ** unit);
    return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
};

export const progressPercent = (item: DownloadItem): number | null => {
    if (typeof item.totalBytes !== 'number' || item.totalBytes <= 0) return null;
    return Math.max(0, Math.min(100, Math.round((item.downloadedBytes / item.totalBytes) * 100)));
};

const normalizedKey = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');

const episodeIdentity = (item: DownloadItem) => {
    const subtitleMatch = item.subtitle?.match(/^S(\d+)\s+E(\d+)(?:\s*[·-]\s*(.*))?$/i);
    const season = item.season ?? (subtitleMatch ? Number(subtitleMatch[1]) : null);
    const episode = item.episode ?? (subtitleMatch ? Number(subtitleMatch[2]) : null);
    const title = subtitleMatch?.[3]?.trim() || item.subtitle || item.title;
    const key = item.videoId ?? (season !== null && episode !== null
        ? `season:${season}:episode:${episode}`
        : `legacy:${normalizedKey(title)}`);
    return { key, season, episode, title };
};

export const groupDownloads = (items: DownloadItem[]): DownloadContentGroup[] => {
    const contents = new Map<string, DownloadContentGroup>();

    [...items]
        .sort((left, right) => right.createdAt - left.createdAt || left.id.localeCompare(right.id))
        .forEach((item) => {
            const inferredEpisode = item.videoId !== null || item.season !== null || item.episode !== null || /^S\d+\s+E\d+/i.test(item.subtitle ?? '');
            const type = item.contentType === 'series' || inferredEpisode ? 'series' : 'movie';
            const contentKey = item.contentId
                ? `${type}:${item.contentId}`
                : `${type}:legacy:${normalizedKey(item.title)}`;
            let content = contents.get(contentKey);
            if (!content) {
                content = {
                    key: contentKey,
                    type,
                    contentId: item.contentId,
                    title: item.title,
                    description: item.description,
                    thumbnailUrl: item.thumbnailUrl,
                    episodes: [],
                    versions: [],
                    createdAt: item.createdAt,
                };
                contents.set(contentKey, content);
            }
            content.createdAt = Math.max(content.createdAt, item.createdAt);
            if (!content.description) content.description = item.description;
            if (!content.thumbnailUrl) content.thumbnailUrl = item.thumbnailUrl;

            if (type === 'movie') {
                content.versions.push(item);
                return;
            }

            const identity = episodeIdentity(item);
            let episode = content.episodes.find(({ key }) => key === identity.key);
            if (!episode) {
                episode = {
                    key: identity.key,
                    videoId: item.videoId,
                    season: identity.season,
                    episode: identity.episode,
                    title: identity.title,
                    description: item.description,
                    thumbnailUrl: item.thumbnailUrl,
                    versions: [],
                    createdAt: item.createdAt,
                };
                content.episodes.push(episode);
            }
            episode.versions.push(item);
            episode.createdAt = Math.max(episode.createdAt, item.createdAt);
            if (!episode.description) episode.description = item.description;
            if (!episode.thumbnailUrl) episode.thumbnailUrl = item.thumbnailUrl;
        });

    return Array.from(contents.values())
        .map((content) => ({
            ...content,
            versions: content.versions.sort((left, right) => right.createdAt - left.createdAt || left.id.localeCompare(right.id)),
            episodes: content.episodes.sort((left, right) => {
                if ((left.season ?? Number.MAX_SAFE_INTEGER) !== (right.season ?? Number.MAX_SAFE_INTEGER)) {
                    return (left.season ?? Number.MAX_SAFE_INTEGER) - (right.season ?? Number.MAX_SAFE_INTEGER);
                }
                if ((left.episode ?? Number.MAX_SAFE_INTEGER) !== (right.episode ?? Number.MAX_SAFE_INTEGER)) {
                    return (left.episode ?? Number.MAX_SAFE_INTEGER) - (right.episode ?? Number.MAX_SAFE_INTEGER);
                }
                return left.createdAt - right.createdAt || left.key.localeCompare(right.key);
            }),
        }))
        .sort((left, right) => right.createdAt - left.createdAt || left.key.localeCompare(right.key));
};
