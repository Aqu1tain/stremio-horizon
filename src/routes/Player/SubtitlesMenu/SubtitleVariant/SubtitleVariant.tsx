// Copyright (C) 2017-2026 Smart code 203358507

import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Icon from '@stremio/stremio-icons/react';
import { Button, ContextMenu } from 'stremio/components';
import { languages, useToast } from 'stremio/common';
import styles from './SubtitleVariant.less';

type SubtitlesTrack = {
    id: string,
    addonSubtitleId?: string,
    lang: string,
    origin: string,
    label?: string,
    url?: string,
    fallbackUrl?: string,
    embedded?: boolean,
    local?: boolean,
    exclusive?: boolean,
};

type Props = {
    track: SubtitlesTrack,
    selected: boolean,
    onSelect: (track: SubtitlesTrack) => void,
};

const SubtitleVariant = ({ track, selected, onSelect }: Props) => {
    const { t } = useTranslation();
    const toast = useToast();
    const buttonRef = useRef<HTMLElement>(null);
    const triggers = useMemo(() => [buttonRef], []);

    const downloadUrl = useMemo(() => {
        return track.fallbackUrl || track.url;
    }, [track.fallbackUrl, track.url]);

    const variantLabel = useMemo(() => {
        return (track.label && track.label.length > 0 && !track.label.startsWith('http'))
            ? track.label
            : languages.label(track.lang);
    }, [track.label, track.lang]);

    const downloadFileName = useMemo(() => {
        return (track.label && track.label.length > 0 && !track.label.startsWith('http'))
            ? track.label
            : `subtitle-${track.lang || 'unknown'}`;
    }, [track.label, track.lang]);

    const canCopyUrl = useMemo(() => {
        return typeof downloadUrl === 'string' && !downloadUrl.startsWith('blob:');
    }, [downloadUrl]);

    const onSelectClick = useCallback(() => {
        onSelect(track);
    }, [onSelect, track]);

    const copyToClipboard = useCallback((value: string, successKey: string, errorKey: string) => {
        navigator.clipboard.writeText(value)
            .then(() => toast.show({ type: 'success', title: t(successKey), timeout: 4000 }))
            .catch(() => toast.show({ type: 'error', title: t(errorKey), timeout: 4000 }));
    }, [toast, t]);

    const onCopyUrlClick = useCallback(() => {
        if (downloadUrl) {
            copyToClipboard(downloadUrl, 'PLAYER_COPY_SUBTITLE_URL_SUCCESS', 'PLAYER_COPY_SUBTITLE_URL_ERROR');
        }
    }, [downloadUrl, copyToClipboard]);

    const onCopyIdClick = useCallback(() => {
        if (track.addonSubtitleId) {
            copyToClipboard(track.addonSubtitleId, 'PLAYER_COPY_SUBTITLE_ID_SUCCESS', 'PLAYER_COPY_SUBTITLE_ID_ERROR');
        }
    }, [track.addonSubtitleId, copyToClipboard]);

    const button = (
        <Button
            ref={buttonRef}
            title={track.label}
            onClick={onSelectClick}
            className={classNames(styles['variant-option'], { 'selected': selected })}
        >
            <div className={styles['info']}>
                <div className={styles['variant-label']}>
                    {variantLabel}
                </div>
                <div className={styles['variant-origin']}>
                    {t(track.origin)}
                </div>
            </div>
            {selected ? <div className={styles['icon']} /> : null}
        </Button>
    );

    if (track.embedded) {
        return button;
    }

    return (
        <>
            {button}
            <ContextMenu on={triggers} autoClose={true} lock={'bottom'}>
                {
                    downloadUrl ?
                        <Button
                            className={styles['context-menu-option']}
                            title={t('CTX_DOWNLOAD_SUBTITLE')}
                            href={downloadUrl}
                            target={'_blank'}
                            download={downloadFileName}
                        >
                            <Icon className={styles['menu-icon']} name={'download'} />
                            <div className={styles['context-menu-option-label']}>
                                {t('CTX_DOWNLOAD_SUBTITLE')}
                            </div>
                        </Button>
                        :
                        null
                }
                {
                    canCopyUrl ?
                        <Button
                            className={styles['context-menu-option']}
                            title={t('CTX_COPY_SUBTITLE_URL')}
                            onClick={onCopyUrlClick}
                        >
                            <Icon className={styles['menu-icon']} name={'link'} />
                            <div className={styles['context-menu-option-label']}>
                                {t('CTX_COPY_SUBTITLE_URL')}
                            </div>
                        </Button>
                        :
                        null
                }
                {
                    track.addonSubtitleId ?
                        <Button
                            className={styles['context-menu-option']}
                            title={t('CTX_COPY_SUBTITLE_ID')}
                            onClick={onCopyIdClick}
                        >
                            <Icon className={styles['menu-icon']} name={'share'} />
                            <div className={styles['context-menu-option-label']}>
                                {t('CTX_COPY_SUBTITLE_ID')}
                            </div>
                        </Button>
                        :
                        null
                }
            </ContextMenu>
        </>
    );
};

export default SubtitleVariant;
