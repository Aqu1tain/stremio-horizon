// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('stremio/components/Icon');
const { t } = require('i18next');
const { useCore } = require('stremio/core');
const { useProfile, usePlatform, useToast, useBinaryState } = require('stremio/common');
const { Button, Image, Popup } = require('stremio/components');
const { default: useRouteFocused } = require('stremio/common/useRouteFocused');
const { default: parseStreamBadges } = require('stremio/common/parseStreamBadges');
const { downloadsAvailable, startDownload } = require('stremio/lib/downloads');
const StreamPlaceholder = require('./StreamPlaceholder');
const styles = require('./styles');

const Stream = ({ className, videoId, videoReleased, videoTitle, videoSeason, videoEpisode, contentId, contentType, contentTitle, contentDescription, contentThumbnail, addonName, name, description, thumbnail, progress, deepLinks, ...props }) => {
    const profile = useProfile();
    const toast = useToast();
    const platform = usePlatform();
    const core = useCore();
    const routeFocused = useRouteFocused();

    const [menuOpen, openMenu, closeMenu, toggleMenu] = useBinaryState(false);
    const [expanded, setExpanded] = React.useState(false);
    const toggleExpanded = React.useCallback((event) => {
        if (!event.nativeEvent.buttonClickPrevented) {
            setExpanded((prev) => !prev);
        }
    }, []);

    const popupLabelOnMouseUp = React.useCallback((event) => {
        if (!event.nativeEvent.togglePopupPrevented) {
            if (event.nativeEvent.ctrlKey || event.nativeEvent.button === 2) {
                event.preventDefault();
                openMenu();
            }
        }
    }, [openMenu]);
    const popupLabelOnContextMenu = React.useCallback((event) => {
        if (!event.nativeEvent.togglePopupPrevented && !event.nativeEvent.ctrlKey && !event.nativeEvent.shiftKey) {
            event.preventDefault();
        }
    }, [toggleMenu]);
    const popupLabelOnLongPress = React.useCallback((event) => {
        if (event.nativeEvent.pointerType !== 'mouse' && !event.nativeEvent.togglePopupPrevented) {
            toggleMenu();
        }
    }, [toggleMenu]);
    const onMoreClick = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
        event.preventDefault();
        toggleMenu();
    }, [toggleMenu]);
    const popupMenuOnPointerDown = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
    }, []);
    const popupMenuOnContextMenu = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
        if (!event.nativeEvent.ctrlKey && !event.nativeEvent.shiftKey) {
            event.preventDefault();
        }
    }, []);
    const popupMenuOnClick = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
    }, []);
    const popupMenuOnKeyDown = React.useCallback((event) => {
        event.nativeEvent.buttonClickPrevented = true;
    }, []);

    const href = React.useMemo(() => {
        return deepLinks ?
            deepLinks.externalPlayer ?
                deepLinks.externalPlayer.web ?
                    deepLinks.externalPlayer.web
                    :
                    deepLinks.externalPlayer.openPlayer ?
                        deepLinks.externalPlayer.openPlayer[platform.name] ?
                            deepLinks.externalPlayer.openPlayer[platform.name]
                            :
                            deepLinks.externalPlayer.playlist
                        :
                        deepLinks.player
                :
                deepLinks.player
            :
            null;
    }, [deepLinks]);

    const download = React.useMemo(() => {
        return href === deepLinks?.externalPlayer?.playlist ?
            deepLinks.externalPlayer.fileName
            :
            null;
    }, [href, deepLinks]);

    const target = React.useMemo(() => {
        return href === deepLinks?.externalPlayer?.web ?
            '_blank'
            :
            null;
    }, [href, deepLinks]);

    const streamLink = React.useMemo(() => {
        return deepLinks?.externalPlayer?.streaming;
    }, [deepLinks]);

    const downloadLink = React.useMemo(() => {
        return deepLinks?.externalPlayer?.download;
    }, [deepLinks]);

    const magnetLink = React.useMemo(() => {
        return deepLinks?.externalPlayer?.magnet;
    }, [deepLinks]);

    const markVideoAsWatched = React.useCallback(() => {
        if (typeof videoId === 'string') {
            core.transport.dispatch({
                action: 'MetaDetails',
                args: {
                    action: 'MarkVideoAsWatched',
                    args: [{ id: videoId, released: videoReleased }, true]
                }
            });
        }
    }, [videoId, videoReleased]);

    const onClick = React.useCallback((event) => {
        if (event.nativeEvent.togglePopupPrevented) {
            return;
        }

        if (profile.settings.playerType !== null) {
            markVideoAsWatched();
            toast.show({
                type: 'success',
                title: 'Stream opened in external player',
                timeout: 4000
            });
        }

        if (typeof props.onClick === 'function') {
            props.onClick(event);
        }
    }, [props.onClick, profile.settings, markVideoAsWatched]);

    const copyMagnetLink = React.useCallback((event) => {
        event.preventDefault();
        closeMenu();
        if (magnetLink) {
            navigator.clipboard.writeText(magnetLink)
                .then(() => {
                    toast.show({
                        type: 'success',
                        title: t('PLAYER_COPY_MAGNET_LINK_SUCCESS'),
                        timeout: 4000
                    });
                })
                .catch(() => {
                    toast.show({
                        type: 'error',
                        title: t('PLAYER_COPY_MAGNET_LINK_ERROR'),
                        timeout: 4000,
                    });
                });
        }
    }, [magnetLink]);

    const copyDownloadLink = React.useCallback((event) => {
        event.preventDefault();
        closeMenu();
        if (downloadLink) {
            navigator.clipboard.writeText(downloadLink)
                .then(() => {
                    toast.show({
                        type: 'success',
                        title: t('PLAYER_COPY_DOWNLOAD_LINK_SUCCESS'),
                        timeout: 4000
                    });
                })
                .catch(() => {
                    toast.show({
                        type: 'error',
                        title: t('PLAYER_COPY_DOWNLOAD_LINK_ERROR'),
                        timeout: 4000,
                    });
                });
        }
    }, [downloadLink]);

    const downloadForOffline = React.useCallback((event) => {
        event.preventDefault();
        event.nativeEvent.buttonClickPrevented = true;
        closeMenu();

        if (!downloadLink) {
            return;
        }

        startDownload({
            url: downloadLink,
            title: contentTitle || videoTitle || name || t('HORIZON_DOWNLOADED_VIDEO'),
            subtitle: videoTitle ? [typeof videoSeason === 'number' && typeof videoEpisode === 'number' ? `S${videoSeason} E${videoEpisode}` : null, videoTitle].filter(Boolean).join(' · ') : null,
            contentType: contentType || null,
            contentId: contentId || null,
            videoId: videoId || null,
            season: typeof videoSeason === 'number' ? videoSeason : null,
            episode: typeof videoEpisode === 'number' ? videoEpisode : null,
            description: contentDescription || null,
            sourceName: [addonName, name].filter(Boolean).join(' · ') || null,
            thumbnailUrl: contentThumbnail || null,
            fileName: deepLinks?.externalPlayer?.fileName || null,
        })
            .then(() => {
                toast.show({
                    type: 'success',
                    title: t('DOWNLOADS_IN_PROGRESS'),
                    message: t('HORIZON_DOWNLOADS_DESCRIPTION'),
                    timeout: 4000,
                });
            })
            .catch(() => {
                toast.show({
                    type: 'error',
                    title: t('DOWNLOADER_NOT_AVAILABLE'),
                    message: t('HORIZON_DOWNLOAD_GENERIC_ERROR'),
                    timeout: 5000,
                });
            });
    }, [addonName, contentDescription, contentId, contentThumbnail, contentTitle, contentType, deepLinks, downloadLink, name, videoEpisode, videoId, videoSeason, videoTitle]);

    const copyStreamLink = React.useCallback((event) => {
        event.preventDefault();
        closeMenu();
        if (streamLink) {
            navigator.clipboard.writeText(streamLink)
                .then(() => {
                    toast.show({
                        type: 'success',
                        title: t('PLAYER_COPY_STREAM_SUCCESS'),
                        timeout: 4000
                    });
                })
                .catch(() => {
                    toast.show({
                        type: 'error',
                        title: t('PLAYER_COPY_STREAM_ERROR'),
                        timeout: 4000,
                    });
                });
        }
    }, [streamLink]);

    const badges = React.useMemo(() => parseStreamBadges(name, description), [name, description]);

    const renderThumbnailFallback = React.useCallback(() => (
        <Icon className={styles['placeholder-icon']} name={'ic_broken_link'} />
    ), []);

    const renderLabel = React.useMemo(() => function renderLabel({ className, children, ...props }) {
        return (
            <Button className={classnames(className, styles['stream-container'], { [styles['expanded']]: expanded })} title={addonName} href={href} target={target} download={download} onClick={onClick} {...props}>
                <div className={styles['info-container']} onClick={toggleExpanded}>
                    {
                        typeof thumbnail === 'string' && thumbnail.length > 0 ?
                            <div className={styles['thumbnail-container']} title={name || addonName}>
                                <Image
                                    className={styles['thumbnail']}
                                    src={thumbnail}
                                    alt={' '}
                                    renderFallback={renderThumbnailFallback}
                                />
                            </div>
                            :
                            <div className={styles['addon-name-container']} title={name || addonName}>
                                <div className={styles['addon-name']}>{name || addonName}</div>
                            </div>
                    }
                    {
                        progress !== null && !isNaN(progress) && progress > 0 ?
                            <div className={styles['progress-bar-container']}>
                                <div className={styles['progress-bar']} style={{ width: `${progress}%` }} />
                                <div className={styles['progress-bar-background']} />
                            </div>
                            :
                            null
                    }
                </div>
                {
                    badges.length > 0 ?
                        <div className={styles['quality-badges']}>
                            {badges.map(({ label, color }) => (
                                <span key={label} className={styles['quality-badge']} style={{ backgroundColor: color }}>{label}</span>
                            ))}
                        </div>
                        :
                        null
                }
                <div className={styles['description-container']} title={description}>{description}</div>
                <div className={styles['more-button']} onClick={onMoreClick}>
                    <Icon className={styles['more-icon']} name={'more-vertical'} />
                </div>
                <Icon className={styles['icon']} name={'play'} />
                {children}
            </Button>
        );
    }, [thumbnail, progress, addonName, name, description, href, target, download, onClick, expanded, toggleExpanded, onMoreClick]);

    const renderMenu = React.useMemo(() => function renderMenu() {
        return (
            <div className={styles['context-menu-content']} onPointerDown={popupMenuOnPointerDown} onContextMenu={popupMenuOnContextMenu} onClick={popupMenuOnClick} onKeyDown={popupMenuOnKeyDown}>
                <div className={styles['context-menu-title']}>
                    {description}
                </div>
                <Button className={styles['context-menu-option-container']} title={t('CTX_PLAY')}>
                    <Icon className={styles['menu-icon']} name={'play'} />
                    <div className={styles['context-menu-option-label']}>{t('CTX_PLAY')}</div>
                </Button>
                {
                    streamLink &&
                        <Button className={styles['context-menu-option-container']} title={t('CTX_COPY_STREAM_LINK')} onClick={copyStreamLink}>
                            <Icon className={styles['menu-icon']} name={'link'} />
                            <div className={styles['context-menu-option-label']}>{t('CTX_COPY_STREAM_LINK')}</div>
                        </Button>
                }
                {
                    magnetLink &&
                        <Button className={styles['context-menu-option-container']} title={t('CTX_COPY_MAGNET_LINK')} onClick={copyMagnetLink}>
                            <Icon className={styles['menu-icon']} name={'magnet-link'} />
                            <div className={styles['context-menu-option-label']}>{t('CTX_COPY_MAGNET_LINK')}</div>
                        </Button>
                }
                {
                    downloadLink && downloadsAvailable() &&
                        <Button className={styles['context-menu-option-container']} title={t('CTX_DOWNLOAD_VIDEO')} onClick={downloadForOffline}>
                            <Icon className={styles['menu-icon']} name={'download'} />
                            <div className={styles['context-menu-option-label']}>{t('CTX_DOWNLOAD_VIDEO')}</div>
                        </Button>
                }
                {
                    downloadLink &&
                        <Button className={styles['context-menu-option-container']} title={t('CTX_DOWNLOAD_VIDEO')} onClick={copyDownloadLink}>
                            <Icon className={styles['menu-icon']} name={'download'} />
                            <div className={styles['context-menu-option-label']}>{t('CTX_COPY_VIDEO_DOWNLOAD_LINK')}</div>
                        </Button>
                }
            </div>
        );
    }, [copyDownloadLink, copyMagnetLink, copyStreamLink, description, downloadForOffline, downloadLink, magnetLink, streamLink]);

    React.useEffect(() => {
        if (!routeFocused) {
            closeMenu();
        }
    }, [routeFocused]);

    return (
        <Popup
            className={className}
            onMouseUp={popupLabelOnMouseUp}
            onLongPress={popupLabelOnLongPress}
            onContextMenu={popupLabelOnContextMenu}
            open={menuOpen}
            onCloseRequest={closeMenu}
            renderLabel={renderLabel}
            renderMenu={renderMenu}
        />
    );
};

Stream.Placeholder = StreamPlaceholder;

Stream.propTypes = {
    className: PropTypes.string,
    videoId: PropTypes.string,
    videoReleased: PropTypes.instanceOf(Date),
    videoTitle: PropTypes.string,
    videoSeason: PropTypes.number,
    videoEpisode: PropTypes.number,
    contentId: PropTypes.string,
    contentType: PropTypes.string,
    contentTitle: PropTypes.string,
    contentDescription: PropTypes.string,
    contentThumbnail: PropTypes.string,
    addonName: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    thumbnail: PropTypes.string,
    progress: PropTypes.number,
    deepLinks: PropTypes.shape({
        player: PropTypes.string,
        externalPlayer: PropTypes.shape({
            download: PropTypes.string,
            magnet: PropTypes.string,
            streaming: PropTypes.string,
            playlist: PropTypes.string,
            fileName: PropTypes.string,
            web: PropTypes.string,
            openPlayer: PropTypes.shape({
                ios: PropTypes.string,
                android: PropTypes.string,
                windows: PropTypes.string,
                macos: PropTypes.string,
                linux: PropTypes.string,
            })
        })
    }),
    onClick: PropTypes.func
};

module.exports = Stream;
