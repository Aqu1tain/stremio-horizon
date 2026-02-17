// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { default: Icon } = require('stremio/components/Icon');
const { Button, Image } = require('stremio/components');
const styles = require('./styles');

const Addon = ({ className, id, name, version, logo, description, types, behaviorHints, installed, onInstall, onUninstall, onConfigure, onOpen, onShare, dataset }) => {
    const { t } = useTranslation();
    const onInstallClick = React.useCallback((event) => {
        event.stopPropagation();
        if (typeof onInstall === 'function') {
            onInstall({
                type: 'install',
                nativeEvent: event.nativeEvent,
                reactEvent: event,
                dataset: dataset
            });
        }
    }, [onInstall, dataset]);
    const onUninstallClick = React.useCallback((event) => {
        event.stopPropagation();
        if (typeof onUninstall === 'function') {
            onUninstall({
                type: 'uninstall',
                nativeEvent: event.nativeEvent,
                reactEvent: event,
                dataset: dataset
            });
        }
    }, [onUninstall, dataset]);
    const onOpenClick = React.useCallback((event) => {
        event.stopPropagation();
        if (typeof onOpen === 'function') {
            onOpen({
                type: 'open',
                nativeEvent: event.nativeEvent,
                reactEvent: event,
                dataset: dataset
            });
        }
    }, [onOpen, dataset]);
    const configureButtonOnClick = React.useCallback((event) => {
        event.stopPropagation();
        if (typeof onConfigure === 'function') {
            onConfigure({
                type: 'configure',
                nativeEvent: event.nativeEvent,
                reactEvent: event,
                dataset: dataset
            });
        }
    }, [onConfigure, dataset]);
    const shareButtonOnClick = React.useCallback((event) => {
        event.stopPropagation();
        if (typeof onShare === 'function') {
            onShare({
                type: 'share',
                nativeEvent: event.nativeEvent,
                reactEvent: event,
                dataset: dataset
            });
        }
    }, [onShare, dataset]);
    const onKeyDown = React.useCallback((event) => {
        if (event.key === 'Enter') {
            onOpenClick(event);
        }
    }, [onOpenClick]);
    const renderLogoFallback = React.useCallback(() => (
        <Icon className={styles['icon']} name={'addons'} />
    ), []);
    const displayName = typeof name === 'string' && name.length > 0 ? name : id;
    const actionLabel = installed ? t('ADDON_UNINSTALL') : behaviorHints.configurationRequired ? t('ADDON_CONFIGURE') : t('ADDON_INSTALL');
    const actionClick = installed ? onUninstallClick : behaviorHints.configurationRequired ? configureButtonOnClick : onInstallClick;
    return (
        <Button className={classnames(className, styles['addon-container'])} onKeyDown={onKeyDown} onClick={onOpenClick}>
            <div className={styles['logo-container']}>
                <Image
                    className={styles['logo']}
                    src={logo}
                    alt={' '}
                    renderFallback={renderLogoFallback}
                />
            </div>
            <div className={styles['info-container']}>
                <div className={styles['name-container']} title={displayName}>
                    {displayName}
                </div>
                {
                    typeof version === 'string' && version.length > 0 ?
                        <div className={styles['version-container']}>{t('ADDON_VERSION_SHORT', {version})}</div>
                        :
                        null
                }
                {
                    Array.isArray(types) && types.length > 0 ?
                        <div className={styles['types-container']}>
                            {types.join(', ')}
                        </div>
                        :
                        null
                }
                {
                    typeof description === 'string' && description.length > 0 ?
                        <div className={styles['description-container']} title={description}>{description}</div>
                        :
                        null
                }
            </div>
            <div className={styles['buttons-container']}>
                <Button
                    className={installed ? styles['uninstall-button-container'] : styles['install-button-container']}
                    title={actionLabel}
                    tabIndex={-1}
                    onClick={actionClick}
                >
                    <div className={styles['label']}>{actionLabel}</div>
                </Button>
                {
                    !behaviorHints.configurationRequired && behaviorHints.configurable ?
                        <Button className={styles['configure-button-container']} title={t('ADDON_CONFIGURE')} tabIndex={-1} onClick={configureButtonOnClick}>
                            <Icon className={styles['icon']} name={'settings'} />
                        </Button>
                        :
                        null
                }
                <Button className={styles['share-button-container']} title={t('SHARE_ADDON')} tabIndex={-1} onClick={shareButtonOnClick}>
                    <Icon className={styles['icon']} name={'share'} />
                </Button>
            </div>
        </Button>
    );
};

Addon.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    version: PropTypes.string,
    logo: PropTypes.string,
    description: PropTypes.string,
    types: PropTypes.arrayOf(PropTypes.string),
    behaviorHints: PropTypes.shape({
        adult: PropTypes.bool,
        configurable: PropTypes.bool,
        configurationRequired: PropTypes.bool,
        p2p: PropTypes.bool,
    }),
    installed: PropTypes.bool,
    onToggle: PropTypes.func,
    onInstall: PropTypes.func,
    onUninstall: PropTypes.func,
    onConfigure: PropTypes.func,
    onOpen: PropTypes.func,
    onShare: PropTypes.func,
    dataset: PropTypes.object
};

module.exports = Addon;
