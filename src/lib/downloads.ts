import { invokeTauri, isTauri, listenTauri } from 'stremio/lib/tauri-events';

export type DownloadStatus = 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';

export type DownloadItem = {
    id: string,
    title: string,
    subtitle: string | null,
    contentType: string | null,
    contentId: string | null,
    videoId: string | null,
    season: number | null,
    episode: number | null,
    description: string | null,
    sourceName: string | null,
    thumbnailUrl: string | null,
    fileName: string,
    status: DownloadStatus,
    downloadedBytes: number,
    totalBytes: number | null,
    createdAt: number,
    updatedAt: number,
    error: string | null,
    playbackUrl: string,
};

export type DownloadRequest = {
    url: string,
    title: string,
    subtitle?: string | null,
    contentType?: string | null,
    contentId?: string | null,
    videoId?: string | null,
    season?: number | null,
    episode?: number | null,
    description?: string | null,
    sourceName?: string | null,
    thumbnailUrl?: string | null,
    fileName?: string | null,
};

export const downloadsAvailable = isTauri;

export const listDownloads = () => invokeTauri<DownloadItem[]>('download_list');

export const getDownloadPlaybackUrl = (id: string) =>
    invokeTauri<string, { id: string }>('download_playback_url', { id });

export const startDownload = (request: DownloadRequest) =>
    invokeTauri<DownloadItem, { request: DownloadRequest }>('download_start', { request });

export const pauseDownload = (id: string) =>
    invokeTauri<DownloadItem, { id: string }>('download_pause', { id });

export const resumeDownload = (id: string) =>
    invokeTauri<DownloadItem, { id: string }>('download_resume', { id });

export const deleteDownload = (id: string) =>
    invokeTauri<void, { id: string }>('download_delete', { id });

export const listenDownloadChanged = (handler: (item: DownloadItem) => void) =>
    listenTauri<DownloadItem>('stremio-download-changed', (event) => handler(event.payload));

export const listenDownloadRemoved = (handler: (id: string) => void) =>
    listenTauri<{ id: string }>('stremio-download-removed', (event) => handler(event.payload.id));
