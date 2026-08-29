import { useEffect, useRef, useState } from 'react';
import { invokeTauri, listenTauri } from 'stremio/common/tauri';

type VlcPlaybackProgress = {
    sessionId: string,
    positionMs: number,
    durationMs: number,
};

type VlcPlaybackResult = VlcPlaybackProgress & {
    completed: boolean,
};

type VlcPlaybackRequest = {
    sessionId: string,
    url: string,
    startTimeMs: number,
    audioLanguage: string | null,
    subtitleLanguage: string | null,
    subtitleUrl: string | null,
    subtitlesEnabled: boolean,
};

type VlcPlaybackStatus = 'idle' | 'launching' | 'playing' | 'failed';

type Options = {
    enabled: boolean,
    url: string | null,
    sessionKey: string | null,
    startTimeMs: number,
    audioLanguage: string | null,
    subtitleLanguage: string | null,
    subtitleUrl: string | null,
    subtitlesEnabled: boolean,
    onProgress: (positionMs: number, durationMs: number, device: string) => void,
    onCompleted: () => void,
    onStopped: () => void,
    onError: (error: Error) => void,
};

const useVlcPlayback = ({
    enabled,
    url,
    sessionKey,
    startTimeMs,
    audioLanguage,
    subtitleLanguage,
    subtitleUrl,
    subtitlesEnabled,
    onProgress,
    onCompleted,
    onStopped,
    onError,
}: Options): VlcPlaybackStatus => {
    const [status, setStatus] = useState<VlcPlaybackStatus>('idle');
    const launchedKeyRef = useRef<string | null>(null);
    const callbacksRef = useRef({ onProgress, onCompleted, onStopped, onError });
    callbacksRef.current = { onProgress, onCompleted, onStopped, onError };

    useEffect(() => {
        if (!enabled || url === null || sessionKey === null || launchedKeyRef.current === sessionKey) {
            return undefined;
        }

        launchedKeyRef.current = sessionKey;
        const sessionId = `${sessionKey}:${Date.now()}`;
        let active = true;
        let unlisten: (() => Promise<void>) | null = null;
        const stopListening = async () => {
            const listener = unlisten;
            unlisten = null;
            if (listener !== null) {
                await listener().catch(() => undefined);
            }
        };

        const run = async () => {
            setStatus('launching');
            try {
                unlisten = await listenTauri<VlcPlaybackProgress>('vlc-playback-progress', ({ payload }) => {
                    if (!active || payload.sessionId !== sessionId) return;
                    setStatus('playing');
                    if (payload.durationMs > 0) {
                        callbacksRef.current.onProgress(payload.positionMs, payload.durationMs, 'VLC');
                    }
                });
                if (!active) {
                    await stopListening();
                    return;
                }

                const result = await invokeTauri<VlcPlaybackResult, { request: VlcPlaybackRequest }>('vlc_play', {
                    request: {
                        sessionId,
                        url,
                        startTimeMs,
                        audioLanguage,
                        subtitleLanguage,
                        subtitleUrl,
                        subtitlesEnabled,
                    },
                });
                if (!active) return;

                if (result.durationMs > 0) {
                    callbacksRef.current.onProgress(result.positionMs, result.durationMs, 'VLC');
                }
                if (result.completed) {
                    callbacksRef.current.onCompleted();
                } else {
                    callbacksRef.current.onStopped();
                }
            } catch (error) {
                if (!active) return;
                setStatus('failed');
                callbacksRef.current.onError(error instanceof Error ? error : new Error(String(error)));
            } finally {
                await stopListening();
            }
        };

        run();

        return () => {
            active = false;
            stopListening();
        };
    }, [audioLanguage, enabled, sessionKey, subtitleLanguage, subtitleUrl, subtitlesEnabled, url]);

    return status;
};

export default useVlcPlayback;
