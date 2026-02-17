import React, { useCallback, useEffect, useState } from 'react';
import Icon from 'stremio/components/Icon';
import { useTranslation } from 'react-i18next';
import { useServices } from 'stremio/services';
import { useBinaryState, useShell } from 'stremio/common';
import { Button, Transition } from 'stremio/components';
import styles from './UpdaterBanner.less';

type Props = {
    className: string,
};

const isTauri = !!(globalThis as any).__TAURI_INTERNALS__;

const invoke = (cmd: string, args?: Record<string, unknown>) =>
    (window as any).__TAURI_INTERNALS__.invoke(cmd, args || {});

const UpdaterBanner = ({ className }: Props) => {
    const { t } = useTranslation();
    const { shell } = useServices();
    const shellTransport = useShell();
    const [visible, show, hide] = useBinaryState(false);
    const [installing, setInstalling] = useState(false);
    const [version, setVersion] = useState('');
    const [progress, setProgress] = useState<number | null>(null);

    const onInstallClick = useCallback(() => {
        if (isTauri) {
            setInstalling(true);
            invoke('install_update').catch(() => setInstalling(false));
        } else {
            shellTransport.send('autoupdater-notif-clicked');
        }
    }, [shellTransport]);

    useEffect(() => {
        if (isTauri) {
            const onUpdateAvailable = (e: CustomEvent) => {
                const detail = typeof e.detail === 'string' ? JSON.parse(e.detail) : e.detail;
                setVersion(detail.version || '');
                show();
            };

            const onUpdateProgress = (e: CustomEvent) => {
                const detail = typeof e.detail === 'string' ? JSON.parse(e.detail) : e.detail;
                if (detail.total > 0) {
                    setProgress(Math.round((detail.downloaded / detail.total) * 100));
                }
            };

            window.addEventListener('stremio-update-available', onUpdateAvailable as EventListener);
            window.addEventListener('stremio-update-progress', onUpdateProgress as EventListener);

            return () => {
                window.removeEventListener('stremio-update-available', onUpdateAvailable as EventListener);
                window.removeEventListener('stremio-update-progress', onUpdateProgress as EventListener);
            };
        }

        shell.transport?.on('autoupdater-show-notif', show);
        return () => { shell.transport?.off('autoupdater-show-notif', show); };
    }, []);

    return (
        <div className={className}>
            <Transition when={visible} name={'slide-up'}>
                <div className={styles['updater-banner']}>
                    <div className={styles['icon-container']}>
                        <Icon className={styles['icon']} name={'download'} />
                    </div>
                    <div className={styles['content']}>
                        <div className={styles['title']}>
                            {version
                                ? `${t('UPDATER_TITLE')} — v${version}`
                                : t('UPDATER_TITLE')
                            }
                        </div>
                    </div>
                    <Button className={styles['install-button']} onClick={onInstallClick} disabled={installing}>
                        {installing
                            ? progress !== null ? `${progress}%` : 'Installing…'
                            : t('UPDATER_INSTALL_BUTTON')
                        }
                        {installing && progress !== null ? (
                            <div className={styles['progress-bar']} style={{ width: `${progress}%` }} />
                        ) : null}
                    </Button>
                    <Button className={styles['close-button']} onClick={hide}>
                        <Icon className={styles['close-icon']} name={'close'} />
                    </Button>
                </div>
            </Transition>
        </div>
    );
};

export default UpdaterBanner;
