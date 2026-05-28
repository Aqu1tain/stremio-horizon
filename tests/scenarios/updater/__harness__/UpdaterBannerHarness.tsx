import React, { useEffect, useState } from 'react';
import { invokeTauri, isTauri, listenTauri } from 'stremio/lib/tauri-events';

type UpdateInfo = { version?: string; body?: string };
type UpdateProgress = { downloaded?: number; total?: number };

// Mirrors the Tauri-path branch of UpdaterBanner.tsx: same imports, same
// command names, same event names, same payload shapes. No i18n, services,
// toast, or shell — those are not part of the updater state machine.
export const UpdaterBannerHarness: React.FC = () => {
    const [version, setVersion] = useState<string | null>(null);
    const [progress, setProgress] = useState<number | null>(null);

    useEffect(() => {
        if (!isTauri()) return;

        const onUpdateAvailable = (update: UpdateInfo) => {
            setVersion(update.version ?? '');
        };
        const onUpdateProgress = (p: UpdateProgress) => {
            if (typeof p.downloaded === 'number' && typeof p.total === 'number' && p.total > 0) {
                setProgress(Math.round((p.downloaded / p.total) * 100));
            }
        };

        const available = listenTauri<UpdateInfo>('stremio-update-available', (e) => onUpdateAvailable(e.payload));
        const progressing = listenTauri<UpdateProgress>('stremio-update-progress', (e) => onUpdateProgress(e.payload));

        invokeTauri<UpdateInfo | null>('get_pending_update')
            .then((u: UpdateInfo | null) => { if (u) onUpdateAvailable(u); })
            .catch(() => undefined);

        return () => {
            available.then((unlisten) => unlisten()).catch(() => undefined);
            progressing.then((unlisten) => unlisten()).catch(() => undefined);
        };
    }, []);

    if (version === null) return null;

    return (
        <div data-testid="update-banner">
            <span data-testid="update-version">{version}</span>
            {progress !== null ? <span data-testid="update-progress">{progress}</span> : null}
        </div>
    );
};
