import React, { useCallback, useEffect, useState } from 'react';
import Icon from 'stremio/components/Icon';
import { useTranslation } from 'react-i18next';
import { useServices } from 'stremio/services';
import { useBinaryState, useShell, useToast } from 'stremio/common';
import { Button, Transition } from 'stremio/components';
import { invokeTauri, isTauri, listenTauri } from 'stremio/common/tauri';
import styles from './UpdaterBanner.less';

type Props = {
    className: string,
};

type UpdateInfo = {
    version?: string,
    body?: string,
};

type UpdateProgress = {
    downloaded?: number,
    total?: number,
};

const UpdaterBanner = ({ className }: Props) => {
    const { t } = useTranslation();
    const { shell } = useServices();
    const shellTransport = useShell();
    const toast = useToast();
    const [visible, show, hide] = useBinaryState(false);
    const [installing, setInstalling] = useState(false);
    const [version, setVersion] = useState('');
    const [progress, setProgress] = useState<number | null>(null);

    const onInstallClick = useCallback(() => {
        if (isTauri()) {
            setInstalling(true);
            setProgress(null);
            invokeTauri('install_update').catch((error: unknown) => {
                setInstalling(false);
                const message = error instanceof Error ? error.message : 'Failed to install update';
                toast.show({
                    type: 'error',
                    title: t('ERROR'),
                    message,
                    timeout: 5000
                });
            });
        } else {
            shellTransport.send('autoupdater-notif-clicked');
        }
    }, [shellTransport, t, toast]);

    useEffect(() => {
        if (isTauri()) {
            const onUpdateAvailable = (update: UpdateInfo) => {
                setVersion(update.version || '');
                setProgress(null);
                setInstalling(false);
                show();
            };

            const onUpdateProgress = (progress: UpdateProgress) => {
                if (typeof progress.downloaded === 'number' && typeof progress.total === 'number' && progress.total > 0) {
                    setProgress(Math.round((progress.downloaded / progress.total) * 100));
                }
            };

            const updateAvailableListener = listenTauri<UpdateInfo>('stremio-update-available', (event) => {
                onUpdateAvailable(event.payload);
            });
            const updateProgressListener = listenTauri<UpdateProgress>('stremio-update-progress', (event) => {
                onUpdateProgress(event.payload);
            });

            invokeTauri<UpdateInfo | null>('get_pending_update')
                .then((update: UpdateInfo | null) => {
                    if (update) {
                        onUpdateAvailable(update);
                    }
                })
                .catch(() => undefined);

            return () => {
                updateAvailableListener.then((unlisten) => unlisten()).catch(() => undefined);
                updateProgressListener.then((unlisten) => unlisten()).catch(() => undefined);
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
