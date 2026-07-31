import { useEffect } from 'react';
import { usePlatform } from 'stremio/common';
import useLiveRef from 'stremio/common/useLiveRef';

const DEFAULT_SEEK_OFFSET = 10;

const MEDIA_SESSION_ACTIONS: MediaSessionAction[] = ['play', 'pause', 'nexttrack', 'seekto', 'seekbackward', 'seekforward'];

// Media Session is absent in some browsers, and setActionHandler throws for any action the
// browser does not implement, so neither installing nor tearing down can be taken for granted.
const setHandler = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
    if (!navigator.mediaSession) return;

    try {
        navigator.mediaSession.setActionHandler(action, handler);
    } catch {
        // Unsupported action — nothing to install and nothing to clean up.
    }
};

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
        const durationSeconds = typeof duration === 'number' ? duration / 1000 : NaN;
        const positionSeconds = typeof time === 'number' ? time / 1000 : NaN;

        // Clear rather than bail out: a stream with no usable duration — a live one, or the
        // gap while the next one loads — would otherwise inherit the previous timeline and
        // let the OS controls seek somewhere meaningless.
        if (!isFinite(durationSeconds) || !isFinite(positionSeconds) || durationSeconds <= 0) {
            navigator.mediaSession.setPositionState();
            return;
        }

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
        setHandler('play', onPlayRequested);
        setHandler('pause', onPauseRequested);
        setHandler('nexttrack', player.nextVideo ? onNextVideoRequested : null);

        setHandler('seekto', ({ seekTime, fastSeek }) => {
            // Dragging the scrubber emits a stream of fastSeek events followed by a
            // final one without it. Committing each intermediate seek fights the drag,
            // because the position effect above keeps re-asserting the stale time.
            if (fastSeek || typeof seekTime !== 'number') return;
            onSeekRequested(seekTime * 1000);
        });
        setHandler('seekbackward', ({ seekOffset }) => {
            const { time } = videoStateRef.current;
            if (typeof time !== 'number') return;
            onSeekRequested(Math.max(time - (seekOffset || DEFAULT_SEEK_OFFSET) * 1000, 0));
        });
        setHandler('seekforward', ({ seekOffset }) => {
            const { time, duration } = videoStateRef.current;
            if (typeof time !== 'number') return;
            const next = time + (seekOffset || DEFAULT_SEEK_OFFSET) * 1000;
            onSeekRequested(typeof duration === 'number' ? Math.min(next, duration) : next);
        });

        const onMediaStatus = ({ paused }: MediaStatus) => {
            paused ? onPauseRequested() : onPlayRequested();
        };

        shell.on('media.status', onMediaStatus);

        return () => {
            MEDIA_SESSION_ACTIONS.forEach((action) => setHandler(action, null));
            shell.off('media.status', onMediaStatus);
        };
    }, [player.nextVideo, onPlayRequested, onPauseRequested, onNextVideoRequested, onSeekRequested]);
};

export default useMediaSession;
