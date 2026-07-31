// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const { default: Icon } = require('stremio/components/Icon');
const { Button } = require('stremio/components');
const shouldShowAllDebridVpnHint = require('./shouldShowAllDebridVpnHint');
const styles = require('./styles');

const ALLDEBRID_VPN_HELP_URL = 'https://alldebrid.com/vpn';

const Error = React.forwardRef(({ className, code, message, sourceStream, stream }, ref) => {
    const { t } = useTranslation();
    const showAllDebridVpnHint = shouldShowAllDebridVpnHint(code, stream) ||
        shouldShowAllDebridVpnHint(code, sourceStream);

    const [playlist, fileName] = React.useMemo(() => {
        return [
            stream?.deepLinks?.externalPlayer?.playlist,
            stream?.deepLinks?.externalPlayer?.fileName,
        ];
    }, [stream]);

    return (
        <div ref={ref} className={classNames(className, styles['error'])}>
            <div className={styles['error-label']} title={message}>{message}</div>
            {
                code === 2 ?
                    <div className={styles['error-sub']} title={t('EXTERNAL_PLAYER_HINT')}>{t('EXTERNAL_PLAYER_HINT')}</div>
                    :
                    null
            }
            {
                showAllDebridVpnHint ?
                    <div className={styles['vpn-hint']}>
                        <div
                            className={styles['error-sub']}
                            title={t('PLAYER_ALLDEBRID_VPN_HINT')}
                        >
                            {t('PLAYER_ALLDEBRID_VPN_HINT')}
                        </div>
                        <Button
                            className={styles['vpn-help-button']}
                            title={t('PLAYER_ALLDEBRID_VPN_HELP')}
                            href={ALLDEBRID_VPN_HELP_URL}
                            target={'_blank'}
                        >
                            {t('PLAYER_ALLDEBRID_VPN_HELP')}
                        </Button>
                    </div>
                    :
                    null
            }
            {
                playlist && fileName ?
                    <Button
                        className={styles['playlist-button']}
                        title={t('PLAYER_OPEN_IN_EXTERNAL')}
                        href={playlist}
                        download={fileName}
                        target={'_blank'}
                    >
                        <Icon className={styles['icon']} name={'ic_downloads'} />
                        <div className={styles['label']}>{t('PLAYER_OPEN_IN_EXTERNAL')}</div>
                    </Button>
                    :
                    null
            }
        </div>
    );
});

Error.propTypes = {
    className: PropTypes.string,
    code: PropTypes.number,
    message: PropTypes.string,
    sourceStream: PropTypes.object,
    stream: PropTypes.object,
};

module.exports = Error;
