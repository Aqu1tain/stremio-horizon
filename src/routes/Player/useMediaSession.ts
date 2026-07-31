import { useEffect } from 'react';
import { usePlatform } from 'stremio/common';
import useLiveRef from 'stremio/common/useLiveRef';

const DEFAULT_SEEK_OFFSET = 10;

const useMediaSession = (
    videoState: VideoState,
    player: Player,
    fullscreen: boolean,
    onPlayRequested: () => void,
    onPauseRequested: () => void,
    onNextVideoRequested: () => void,
    onSeekRequested: (time: number) => void,
) => {
    const { shell } = usePlatform();
    const videoStateRef = useLiveRef(videoState);

    useEffect(() => {
        if (!('audioSession' in navigator)) return;
        const audioSession = (navigator as any).audioSession;
        audioSession.type = fullscreen ? 'ambient' : 'playback';
        return () => {
            audioSession.type = 'playback';
        };
    }, [fullscreen]);

    // Playback state
    useEffect(() => {
        if (navigator.mediaSession) {
            const playbackState = videoState.paused === null ? 'none' : videoState.paused ? 'paused' : 'playing';
            navigator.mediaSession.playbackState = playbackState;
        }

        if (shell.active) {
            shell.send('media.status', {
                paused: !!videoState.paused,
            });
        }

        return () => {
            if (navigator.mediaSession) {
                navigator.mediaSession.playbackState = 'none';
            }
        };
    }, [videoState.paused]);

    // Position — the Picture-in-Picture window and the OS media controls draw their
    // scrubber from this alone; without it their timeline is inert. Core reports
    // milliseconds, the Media Session API wants seconds.
    useEffect(() => {
        if (!navigator.mediaSession || typeof navigator.mediaSession.setPositionState !== 'function') return;

        const { time, duration, playbackSpeed } = videoState;
        if (typeof time !== 'number' || typeof duration !== 'number') return;

        const durationSeconds = duration / 1000;
        const positionSeconds = time / 1000;
        if (!isFinite(durationSeconds) || !isFinite(positionSeconds) || durationSeconds <= 0) return;

        navigator.mediaSession.setPositionState({
            duration: durationSeconds,
            position: Math.min(Math.max(positionSeconds, 0), durationSeconds),
            playbackRate: playbackSpeed || 1,
        });
    }, [videoState.time, videoState.duration, videoState.playbackSpeed]);

    // Metadata
    useEffect(() => {
        const metaItem = player.metaItem && player.metaItem?.type === 'Ready' ? player.metaItem.content as MetaItemPlayer : null;
        const videoId = player.selected ? player.selected?.streamRequest?.path?.id : null;
        const video = metaItem?.videos.find(({ id }) => id === videoId);

        const videoInfo = video?.season && video?.episode ? ` (${video.season}x${video.episode})` : null;
        const videoTitle = video ? `${video.title}${videoInfo}` : null;
        const metaTitle = metaItem ? metaItem.name : null;
        const imageUrl = metaItem ? metaItem.logo : null;

        const title = videoTitle ?? metaTitle;
        const artist = (videoTitle && metaTitle) ?? undefined;
        const artwork = imageUrl ? [{ src: imageUrl }] : undefined;

        if (title) {
            if (navigator.mediaSession) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title,
                    artist,
                    artwork,
                });
            }

            if (shell.active) {
                shell.send('media.metadata', {
                    title,
                    artist,
                    artUrl: imageUrl,
                });
            }
        }
    }, [player.metaItem, player.selected]);

    // Callbacks
    useEffect(() => {
        if (navigator.mediaSession) {
            navigator.mediaSession.setActionHandler('play', onPlayRequested);
            navigator.mediaSession.setActionHandler('pause', onPauseRequested);
        }

        const nexVideoCallback = player.nextVideo ? onNextVideoRequested : null;
        if (navigator.mediaSession && nexVideoCallback) {
            navigator.mediaSession.setActionHandler('nexttrack', nexVideoCallback);
        }

        if (navigator.mediaSession) {
            navigator.mediaSession.setActionHandler('seekto', ({ seekTime, fastSeek }) => {
                // Dragging the scrubber emits a stream of fastSeek events followed by a
                // final one without it. Committing each intermediate seek fights the drag,
                // because the position effect below keeps re-asserting the stale time.
                if (fastSeek || typeof seekTime !== 'number') return;
                onSeekRequested(seekTime * 1000);
            });
            navigator.mediaSession.setActionHandler('seekbackward', ({ seekOffset }) => {
                const { time } = videoStateRef.current;
                if (typeof time !== 'number') return;
                onSeekRequested(Math.max(time - (seekOffset || DEFAULT_SEEK_OFFSET) * 1000, 0));
            });
            navigator.mediaSession.setActionHandler('seekforward', ({ seekOffset }) => {
                const { time, duration } = videoStateRef.current;
                if (typeof time !== 'number') return;
                const next = time + (seekOffset || DEFAULT_SEEK_OFFSET) * 1000;
                onSeekRequested(typeof duration === 'number' ? Math.min(next, duration) : next);
            });
        }

        const onMediaStatus = ({ paused }: MediaStatus) => {
            paused ? onPauseRequested() : onPlayRequested();
        };

        shell.on('media.status', onMediaStatus);

        return () => {
            navigator.mediaSession.setActionHandler('play', null);
            navigator.mediaSession.setActionHandler('pause', null);
            navigator.mediaSession.setActionHandler('nexttrack', null);
            navigator.mediaSession.setActionHandler('seekto', null);
            navigator.mediaSession.setActionHandler('seekbackward', null);
            navigator.mediaSession.setActionHandler('seekforward', null);
            shell.off('media.status', onMediaStatus);
        };
    }, [player.nextVideo, onPlayRequested, onPauseRequested, onNextVideoRequested, onSeekRequested]);
};

export default useMediaSession;
