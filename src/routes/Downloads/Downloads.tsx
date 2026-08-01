import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useCore } from 'stremio/core';
import { useToast } from 'stremio/common';
import { Icon, Image, MainNavBars } from 'stremio/components';
import {
    deleteDownload,
    downloadsAvailable,
    getDownloadPlaybackUrl,
    listDownloads,
    listenDownloadChanged,
    listenDownloadRemoved,
    pauseDownload,
    resumeDownload,
} from 'stremio/lib/downloads';
import type { DownloadItem } from 'stremio/lib/downloads';
import { formatBytes, groupDownloads, mergeDownload, progressPercent } from './utils';
import styles from './Downloads.less';

const Downloads = () => {
    const { t } = useTranslation();
    const core = useCore();
    const navigate = useNavigate();
    const toast = useToast();
    const [items, setItems] = useState<DownloadItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set());
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());
    const [expandedVersions, setExpandedVersions] = useState<Set<string>>(() => new Set());
    const [error, setError] = useState<string | null>(null);

    const runAction = useCallback(async (id: string, action: () => Promise<unknown>) => {
        setBusyIds((current) => new Set(current).add(id));
        try {
            await action();
        } catch {
            toast.show({
                type: 'error',
                title: t('ERROR'),
                message: t('HORIZON_DOWNLOAD_ACTION_FAILED'),
                timeout: 5000,
            });
        } finally {
            setBusyIds((current) => {
                const next = new Set(current);
                next.delete(id);
                return next;
            });
        }
    }, [t, toast]);

    useEffect(() => {
        if (!downloadsAvailable()) {
            setLoading(false);
            return;
        }

        let active = true;
        listDownloads()
            .then((downloads) => active && setItems(downloads))
            .catch((listError) => active && setError(listError instanceof Error ? listError.message : String(listError)))
            .finally(() => active && setLoading(false));

        const changedListener = listenDownloadChanged((changed) => {
            if (active) setItems((current) => mergeDownload(current, changed));
        });
        const removedListener = listenDownloadRemoved((id) => {
            if (active) setItems((current) => current.filter((item) => item.id !== id));
        });

        return () => {
            active = false;
            changedListener.then((unlisten) => unlisten()).catch(() => undefined);
            removedListener.then((unlisten) => unlisten()).catch(() => undefined);
        };
    }, []);

    const completedSize = useMemo(() => {
        return items
            .filter((item) => item.status === 'completed')
            .reduce((total, item) => total + item.downloadedBytes, 0);
    }, [items]);
    const groups = useMemo(() => groupDownloads(items), [items]);

    const toggleSetValue = useCallback((setter: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) => {
        setter((current) => {
            const next = new Set(current);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }, []);

    const onPlay = useCallback(async (item: DownloadItem) => {
        try {
            const playbackUrl = await getDownloadPlaybackUrl(item.id);
            const encoded = await core.transport.encodeStream({
                name: item.title,
                description: item.subtitle || item.fileName,
                url: playbackUrl,
            });
            navigate(`/player/${encodeURIComponent(encoded)}`);
        } catch {
            toast.show({
                type: 'error',
                title: t('ERROR'),
                message: t('HORIZON_OFFLINE_PLAYBACK_FAILED'),
                timeout: 5000,
            });
        }
    }, [core, navigate, t, toast]);

    const statusLabels: Record<DownloadItem['status'], string> = {
        queued: t('HORIZON_DOWNLOAD_QUEUED'),
        downloading: t('DOWNLOADS_IN_PROGRESS'),
        paused: t('CTX_PAUSED'),
        completed: t('CTX_AVAILABLE_OFFLINE'),
        failed: t('ERROR'),
    };

    const getVersionState = (item: DownloadItem) => {
        const percent = progressPercent(item);
        const busy = busyIds.has(item.id);
        const active = item.status === 'downloading' || item.status === 'queued';
        const legacyHlsError = item.error?.includes('segmented HLS downloads');
        const sourceNotReady = item.error?.includes('source only provided');
        const errorMessage = legacyHlsError
            ? t('HORIZON_HLS_RETRY')
            : sourceNotReady ? t('HORIZON_SOURCE_NOT_READY')
                : item.error ? t('HORIZON_DOWNLOAD_GENERIC_ERROR') : null;

        return { percent, busy, active, legacyHlsError, sourceNotReady, errorMessage };
    };

    const renderActions = (item: DownloadItem, compact = false) => {
        const { busy, active, legacyHlsError, sourceNotReady } = getVersionState(item);

        return (
            <div className={`${styles['actions']} ${compact ? styles['compact-actions'] : ''}`}>
                {item.status === 'completed' && (
                    <button
                        className={styles['primary-action']}
                        disabled={busy}
                        title={t('CTX_PLAY')}
                        aria-label={t('CTX_PLAY')}
                        onClick={() => onPlay(item)}
                    >
                        <Icon name={'play'} />
                        {!compact && <span>{t('CTX_PLAY')}</span>}
                    </button>
                )}
                {active ? (
                    <button
                        disabled={busy}
                        title={t('DOWNLOADER_PAUSE')}
                        aria-label={t('DOWNLOADER_PAUSE')}
                        onClick={() => runAction(item.id, () => pauseDownload(item.id))}
                    >
                        <Icon name={'pause'} />
                        {!compact && <span>{t('DOWNLOADER_PAUSE')}</span>}
                    </button>
                ) : item.status !== 'completed' ? (
                    <button
                        className={styles['primary-action']}
                        disabled={busy}
                        title={legacyHlsError || sourceNotReady ? t('HORIZON_RETRY') : t('DOWNLOADER_RESUME')}
                        aria-label={legacyHlsError || sourceNotReady ? t('HORIZON_RETRY') : t('DOWNLOADER_RESUME')}
                        onClick={() => runAction(item.id, () => resumeDownload(item.id))}
                    >
                        <Icon name={'reset'} />
                        {!compact && <span>{legacyHlsError || sourceNotReady ? t('HORIZON_RETRY') : t('DOWNLOADER_RESUME')}</span>}
                    </button>
                ) : null}
                {!active && (
                    <button
                        className={styles['delete-button']}
                        disabled={busy}
                        title={t('BUTTON_DELETE')}
                        aria-label={t('BUTTON_DELETE')}
                        onClick={() => runAction(item.id, () => deleteDownload(item.id))}
                    >
                        <Icon name={'bin'} />
                    </button>
                )}
            </div>
        );
    };

    const renderDownloadState = (item: DownloadItem) => {
        const { percent, errorMessage } = getVersionState(item);
        const transferring = item.status === 'downloading';

        if (!transferring && item.status !== 'paused' && !errorMessage) return null;

        return (
            <div className={styles['download-state']}>
                {(transferring || item.status === 'paused') && (
                    <>
                        <div className={styles['size-row']}>
                            <span>
                                {formatBytes(item.downloadedBytes)}
                                {item.totalBytes ? ` / ${formatBytes(item.totalBytes)}` : ''}
                            </span>
                            {percent !== null && <strong>{percent}%</strong>}
                        </div>
                        <div className={`${styles['progress-track']} ${percent === null && transferring ? styles['progress-indeterminate'] : ''}`}>
                            <div className={styles['progress-value']} style={{ width: `${percent ?? (transferring ? 28 : 0)}%` }} />
                        </div>
                    </>
                )}
                {errorMessage && (
                    <p className={styles['error']}>
                        <Icon name={'about'} />
                        {errorMessage}
                    </p>
                )}
            </div>
        );
    };

    const renderVersion = (item: DownloadItem) => {
        const { active } = getVersionState(item);

        return (
            <div key={item.id} className={styles['version-row']}>
                <div className={styles['version-main']}>
                    <div className={styles['version-heading']}>
                        {item.status !== 'completed' && <span className={`${styles['status-dot']} ${styles[`status-${item.status}`]}`} />}
                        <strong>{item.sourceName || item.fileName}</strong>
                        <span className={styles['version-size']}>
                            {item.status === 'completed'
                                ? formatBytes(item.downloadedBytes)
                                : item.totalBytes ? formatBytes(item.totalBytes) : statusLabels[item.status]}
                        </span>
                        {item.status !== 'completed' && !active && <span>{statusLabels[item.status]}</span>}
                    </div>
                    {renderDownloadState(item)}
                </div>
                {renderActions(item, true)}
            </div>
        );
    };

    return (
        <MainNavBars className={styles['downloads-container']} route={'downloads'}>
            <div className={styles['content']}>
                <header className={styles['header']}>
                    <h1>{t('DOWNLOADS')}</h1>
                    {completedSize > 0 && <span>{formatBytes(completedSize)}</span>}
                </header>

                {!downloadsAvailable() ? (
                    <div className={styles['empty-state']}>
                        <Icon name={'download'} className={styles['empty-icon']} />
                        <h2>{t('DOWNLOADER_NOT_AVAILABLE_ON_WEB')}</h2>
                    </div>
                ) : loading ? (
                    <div className={styles['loading-list']}>
                        {Array.from({ length: 3 }).map((_, index) => <div key={index} />)}
                    </div>
                ) : error ? (
                    <div className={styles['empty-state']}>
                        <Icon name={'about'} className={styles['empty-icon']} />
                        <h2>{t('DOWNLOADER_NOT_AVAILABLE')}</h2>
                        <p>{error}</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className={styles['empty-state']}>
                        <Icon name={'download'} className={styles['empty-icon']} />
                        <h2>{t('NO_DOWNLOADS_IN_PROGRESS')}</h2>
                        <p>{t('HORIZON_DOWNLOADS_DESCRIPTION')}</p>
                    </div>
                ) : (
                    <div className={styles['downloads-list']}>
                        {groups.map((group) => {
                            const allVersions = group.type === 'series'
                                ? group.episodes.flatMap((episode) => episode.versions)
                                : group.versions;
                            const collapsed = collapsedGroups.has(group.key);
                            const groupSize = allVersions
                                .filter((item) => item.status === 'completed')
                                .reduce((total, item) => total + item.downloadedBytes, 0);
                            return (
                                <article key={group.key} className={styles['content-group']}>
                                    <header className={styles['group-header']}>
                                        <div className={styles['group-artwork']}>
                                            {group.thumbnailUrl ? (
                                                <Image
                                                    className={styles['artwork-image']}
                                                    src={group.thumbnailUrl}
                                                    alt={' '}
                                                    renderFallback={() => <Icon name={group.type === 'series' ? 'episodes' : 'download'} />}
                                                />
                                            ) : <Icon name={group.type === 'series' ? 'episodes' : 'download'} />}
                                        </div>
                                        <div className={styles['group-copy']}>
                                            <h2>{group.title}</h2>
                                            <div className={styles['group-summary']}>
                                                <span>{group.type === 'series'
                                                    ? t('HORIZON_EPISODE_COUNT', { count: group.episodes.length })
                                                    : t('HORIZON_VERSION_COUNT', { count: group.versions.length })}</span>
                                                {groupSize > 0 && <span>{formatBytes(groupSize)}</span>}
                                            </div>
                                        </div>
                                        <button
                                            className={`${styles['collapse-button']} ${collapsed ? styles['collapsed'] : ''}`}
                                            title={collapsed ? t('SHOW_MORE') : t('SHOW_LESS')}
                                            onClick={() => toggleSetValue(setCollapsedGroups, group.key)}
                                        >
                                            <Icon name={'caret-down'} />
                                        </button>
                                    </header>

                                    {!collapsed && group.type === 'series' && (
                                        <div className={styles['episodes-list']}>
                                            {group.episodes.map((episode) => {
                                                const versionsKey = `${group.key}:${episode.key}`;
                                                const versionsOpen = expandedVersions.has(versionsKey);
                                                const primaryVersion = episode.versions[0];
                                                return (
                                                    <section key={episode.key} className={styles['episode-row']}>
                                                        <div className={styles['episode-artwork']}>
                                                            {episode.thumbnailUrl ? (
                                                                <Image className={styles['artwork-image']} src={episode.thumbnailUrl} alt={' '} renderFallback={() => <Icon name={'episodes'} />} />
                                                            ) : <Icon name={'episodes'} />}
                                                        </div>
                                                        <div className={styles['episode-copy']}>
                                                            <span>{episode.season !== null && episode.episode !== null ? `S${episode.season} E${episode.episode}` : t('EPISODE')}</span>
                                                            <h3>{episode.title}</h3>
                                                            <div className={styles['episode-meta']}>
                                                                <span>{primaryVersion.sourceName || primaryVersion.fileName}</span>
                                                                {primaryVersion.downloadedBytes > 0 && <span>{formatBytes(primaryVersion.downloadedBytes)}</span>}
                                                                {primaryVersion.status === 'queued' && <span className={styles['queued-label']}>{statusLabels.queued}</span>}
                                                                {episode.versions.length > 1 && (
                                                                    <button onClick={() => toggleSetValue(setExpandedVersions, versionsKey)}>
                                                                        {t('HORIZON_VERSION_COUNT', { count: episode.versions.length })}
                                                                        <Icon className={versionsOpen ? styles['open'] : ''} name={'caret-down'} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {renderActions(primaryVersion, true)}
                                                        <div className={styles['episode-download-state']}>{renderDownloadState(primaryVersion)}</div>
                                                        {episode.versions.length > 1 && versionsOpen && (
                                                            <div className={styles['versions-panel']}>
                                                                {episode.versions.map(renderVersion)}
                                                            </div>
                                                        )}
                                                    </section>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {!collapsed && group.type === 'movie' && (
                                        <div className={styles['movie-versions']}>
                                            {group.versions.length > 1 && (
                                                <div className={styles['versions-label']}>{t('HORIZON_AVAILABLE_VERSIONS')}</div>
                                            )}
                                            {group.versions.map(renderVersion)}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainNavBars>
    );
};

export default Downloads;
