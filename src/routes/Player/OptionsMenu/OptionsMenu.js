// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { usePlatform, useToast } = require('stremio/common');
const { downloadsAvailable, startDownload } = require('stremio/lib/downloads');
const { default: usePlayOnDevice } = require('../usePlayOnDevice');
const Option = require('./Option');
const styles = require('./styles');

const OptionsMenu = React.memo(React.forwardRef(({ className, stream, downloadContext, playbackDevices, extraSubtitlesTracks, selectedExtraSubtitlesTrackId }, ref) => {
    const { t } = useTranslation();
    const platform = usePlatform();
    const toast = useToast();
    const { streamingUrl, playOnDevice } = usePlayOnDevice(stream);
    const [downloadUrl, magnetUrl] = React.useMemo(() => {
        return stream !== null ?
            stream.deepLinks &&
            stream.deepLinks.externalPlayer &&
            [
                stream.deepLinks.externalPlayer.download,
                stream.deepLinks.externalPlayer.magnet,
            ]
            :
            [null, null];
    }, [stream]);
    const externalDevices = React.useMemo(() => {
        return playbackDevices.filter(({ type }) => type === 'external');
    }, [playbackDevices]);

    const subtitlesTrackUrl = React.useMemo(() => {
        const track = extraSubtitlesTracks?.find(({ id }) => id === selectedExtraSubtitlesTrackId);
        return track?.fallbackUrl ?? track?.url ?? null;
    }, [extraSubtitlesTracks, selectedExtraSubtitlesTrackId]);

    const onCopyStreamButtonClick = React.useCallback(() => {
        if (streamingUrl || downloadUrl) {
            navigator.clipboard.writeText(streamingUrl || downloadUrl)
                .then(() => {
                    toast.show({
                        type: 'success',
                        title: 'Copied',
                        message: t('PLAYER_COPY_STREAM_SUCCESS'),
                        timeout: 3000
                    });
                })
                .catch((e) => {
                    console.error(e);
                    toast.show({
                        type: 'error',
                        title: t('ERROR'),
                        message: `${t('PLAYER_COPY_STREAM_ERROR')}: ${streamingUrl || downloadUrl}`,
                        timeout: 3000
                    });
                });
        }
    }, [streamingUrl, downloadUrl]);
    const onCopyMagnetButtonClick = React.useCallback(() => {
        if (magnetUrl) {
            navigator.clipboard.writeText(magnetUrl)
                .then(() => {
                    toast.show({
                        type: 'success',
                        title: 'Copied',
                        message: t('PLAYER_COPY_MAGNET_LINK_SUCCESS'),
                        timeout: 3000
                    });
                })
                .catch((e) => {
                    console.error(e);
                    toast.show({
                        type: 'error',
                        title: t('Error'),
                        message: `${t('PLAYER_COPY_MAGNET_LINK_ERROR')}: ${magnetUrl}`,
                        timeout: 3000
                    });
                });
        }
    }, [magnetUrl]);
    const onDownloadVideoButtonClick = React.useCallback(() => {
        if (downloadUrl) {
            if (!downloadsAvailable()) {
                platform.openExternal(downloadUrl);
                return;
            }

            startDownload({
                url: downloadUrl,
                title: downloadContext?.title || stream?.name || 'Downloaded video',
                subtitle: downloadContext?.subtitle || stream?.description || null,
                contentType: downloadContext?.contentType || null,
                contentId: downloadContext?.contentId || null,
                videoId: downloadContext?.videoId || null,
                season: downloadContext?.season ?? null,
                episode: downloadContext?.episode ?? null,
                description: downloadContext?.description || null,
                sourceName: stream?.addonName || null,
                thumbnailUrl: downloadContext?.thumbnailUrl || stream?.thumbnail || null,
                fileName: stream?.deepLinks?.externalPlayer?.fileName || null,
            })
                .then(() => {
                    toast.show({
                        type: 'success',
                        title: t('DOWNLOADS_IN_PROGRESS'),
                        message: t('HORIZON_DOWNLOADS_DESCRIPTION'),
                        timeout: 4000,
                    });
                })
                .catch((downloadError) => {
                    toast.show({
                        type: 'error',
                        title: t('DOWNLOADER_NOT_AVAILABLE'),
                        message: downloadError instanceof Error ? downloadError.message : String(downloadError),
                        timeout: 5000,
                    });
                });
        }
    }, [downloadContext, downloadUrl, platform, stream, toast]);

    const onDownloadSubtitlesClick = React.useCallback(() => {
        subtitlesTrackUrl && platform.openExternal(subtitlesTrackUrl);
    }, [subtitlesTrackUrl]);

    const onMouseDown = React.useCallback((event) => {
        event.nativeEvent.optionsMenuClosePrevented = true;
    }, []);

    return (
        <div ref={ref} className={classnames(className, styles['options-menu-container'])} onMouseDown={onMouseDown}>
            {
                streamingUrl || downloadUrl ?
                    <Option
                        icon={'link'}
                        label={t('CTX_COPY_STREAM_LINK')}
                        disabled={stream === null}
                        onClick={onCopyStreamButtonClick}
                    />
                    :
                    null
            }
            {
                magnetUrl ?
                    <Option
                        icon={'magnet-link'}
                        label={t('CTX_COPY_MAGNET_LINK')}
                        disabled={stream === null}
                        onClick={onCopyMagnetButtonClick}
                    />
                    :
                    null
            }
            {
                downloadUrl ?
                    <Option
                        icon={'download'}
                        label={t('CTX_DOWNLOAD_VIDEO')}
                        disabled={stream === null}
                        onClick={onDownloadVideoButtonClick}
                    />
                    :
                    null
            }
            {
                subtitlesTrackUrl ?
                    <Option
                        icon={'download'}
                        label={t('CTX_DOWNLOAD_SUBS')}
                        disabled={stream === null}
                        onClick={onDownloadSubtitlesClick}
                    />
                    :
                    null
            }
            {
                streamingUrl && externalDevices.map(({ id, name }) => (
                    <Option
                        key={id}
                        icon={'vlc'}
                        label={t('PLAYER_PLAY_IN', { device: name })}
                        deviceId={id}
                        disabled={stream === null}
                        onClick={playOnDevice}
                    />
                ))
            }
        </div>
    );
}));

OptionsMenu.propTypes = {
    className: PropTypes.string,
    stream: PropTypes.object,
    downloadContext: PropTypes.object,
    playbackDevices: PropTypes.array,
    extraSubtitlesTracks: PropTypes.array,
    selectedExtraSubtitlesTrackId: PropTypes.string,
};

module.exports = OptionsMenu;
